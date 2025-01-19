import { addDays, differenceInSeconds, getDate } from "date-fns";
import * as OneSignal from "onesignal-node";
import api from "../../config/api";
import prismaClient from "../../prisma";
import { validateEmail } from "../../config/functions";

interface ClientRequest {
  name: string;
  phoneNumber: string;
  email: string;
  spaceId: string;
  value: number;
  dayDue: number;
  consultancy: boolean;
  professionalId: string;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

class CreateClientProfessionalService {
  async execute({
    name,
    professionalId,
    phoneNumber,
    email,
    consultancy,
    spaceId,
    value,
    dayDue,
    schedule,
  }: ClientRequest) {
    if (
      !name ||
      !phoneNumber ||
      !professionalId ||
      (!consultancy && !spaceId) ||
      !value ||
      !dayDue ||
      !email ||
      (!consultancy && !schedule.length)
    ) {
      throw new Error("Todos os campos são obrigatórios");
    }

    if (spaceId) {
      const space = await prismaClient.space.findUnique({
        where: {
          id: spaceId,
        },
      });

      if (!space) {
        throw new Error("Academia não encontrada");
      }
    }

    let data = {
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      spaceId: spaceId,
      value: value,
      professionalId: professionalId,
      consultancy: consultancy,
      dayDue: dayDue,
    };

    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email: email,
        OR: [
          {
            role: "PROFESSIONAL",
          },
          {
            role: "SPACE",
          },
        ],
      },
    });

    const professional = await prismaClient.professional.findFirst({
      where: {
        id: professionalId,
      },
    });

    const day = getDate(new Date());

    if (userAlreadyExists) {
      throw new Error("Email já está sendo usado por outro tipo de usuário");
    }

    if (!validateEmail(email)) {
      throw new Error("Email inválido");
    }

    const clientAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    if (clientAlreadyExists) {
      data["clientId"] = clientAlreadyExists.id;

      const clientProfessionalAlreadyExists =
        await prismaClient.clientsProfessional.findFirst({
          where: {
            clientId: clientAlreadyExists.id,
            professionalId: professionalId,
            status: {
              not: "cancelled",
            },
          },
        });

      if (clientProfessionalAlreadyExists) {
        throw new Error("Você já cadastrou um aluno usando esse email");
      }
    }

    const clientProfessional = await prismaClient.clientsProfessional.create({
      data: {
        ...data,
        status: data["clientId"]
          ? dayDue > day
            ? "overdue"
            : "active"
          : "registration_pending",
      },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        professional: true,
      },
    });

    const valueClientAll = value * 100;
    const valuePaid = valueClientAll * 1.02;

    if (!consultancy) {
      schedule.map(async (item) => {
        await prismaClient.schedule.create({
          data: {
            professionalId: professionalId,
            clientProfessionalId: clientProfessional.id,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            recurring: true,
            isBlock: false,
            date: new Date(),
          },
        });
      });
    }

    if (data["clientId"]) {
      const client = new OneSignal.Client(
        "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
        "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
      );

      await client.createNotification({
        headings: {
          en: "Novas Aulas",
          pt: "Novas Aulas",
        },
        contents: {
          en: `${clientProfessional.professional.name.toUpperCase()} cadastrou você como aluno`,
          pt: `${clientProfessional.professional.name.toUpperCase()} cadastrou você como aluno`,
        },
        data: {
          screen: "ClientSchedule",
          params: {
            id: clientProfessional.id,
          },
        },
        include_external_user_ids: [clientProfessional.clientId],
      });

      await prismaClient.notification.create({
        data: {
          title: "Novas Aulas",
          message: `${clientProfessional.professional.name.toUpperCase()} cadastrou você como aluno`,
          type: "ClientSchedule",
          dataId: clientProfessional.id,
          userId: clientProfessional.client.id,
        },
      });

      if (clientProfessional.dayDue >= day + 1) {
        await api
          .post("/orders", {
            closed: true,
            items: [
              {
                amount: valuePaid,
                description: `Mensalidade ${
                  consultancy ? "Consultoria" : "Personal"
                }`,
                quantity: 1,
                code: 1,
              },
            ],
            customer: {
              name: clientProfessional.client.name,
              type: "individual",
              document: clientProfessional.client.cpf,
              email: clientProfessional.client.user.email,
              phones: {
                mobile_phone: {
                  country_code: "55",
                  number: "000000000",
                  area_code: "11",
                },
              },
            },
            payments: [
              {
                payment_method: "pix",
                pix: {
                  expires_in: differenceInSeconds(
                    addDays(new Date(), 5),
                    new Date()
                  ),
                  additional_information: [
                    {
                      name: "information",
                      value: "number",
                    },
                  ],
                },
                split: [
                  {
                    amount: valueClientAll,
                    recipient_id: professional.recipientId,
                    type: "flat",
                    options: {
                      charge_processing_fee: false,
                      charge_remainder_fee: false,
                      liable: false,
                    },
                  },
                  {
                    amount: valuePaid - valueClientAll,
                    recipient_id: "re_cm2uxwdzw3j720m9tiinncic7",
                    type: "flat",
                    options: {
                      charge_processing_fee: true,
                      charge_remainder_fee: true,
                      liable: true,
                    },
                  },
                ],
              },
            ],
          })
          .then(async (response) => {
            const order = await prismaClient.payment.create({
              data: {
                description: `Mensalidade ${
                  consultancy ? "Consultoria" : "Personal"
                }`,
                professionalId: professionalId,
                clientId: clientProfessional.client.id,
                rate: (valuePaid - valueClientAll) / 100,
                recurring: true,
                type: "recurring",
                value: valueClientAll / 100,
                orderId: response.data.id,
                expireAt: addDays(new Date(), 5),
                items: {
                  create: [
                    {
                      type: "recurring",
                      value: value,
                      amount: 1,
                    },
                  ],
                },
              },
            });

            return order;
          })
          .catch((e) => {
            throw new Error("Ocorreu um erro ao criar cobrança");
          });
      }

      return clientProfessional;
    }
  }
}

export { CreateClientProfessionalService };
