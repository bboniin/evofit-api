import {
  addDays,
  addYears,
  differenceInSeconds,
  getDate,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
} from "date-fns";
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
  dateNextPayment: Date;
  consultancy: boolean;
  billingPeriod: string;
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
    dateNextPayment,
    billingPeriod,
    schedule,
  }: ClientRequest) {
    if (
      !name ||
      !phoneNumber ||
      !professionalId ||
      (!consultancy && !spaceId) ||
      !value ||
      !dateNextPayment ||
      !email ||
      (!consultancy && !schedule.length)
    ) {
      throw new Error("Todos os campos são obrigatórios");
    }

    if (spaceId) {
      const space = await prismaClient.space.findUnique({
        where: {
          id: spaceId,
          isDeleted: false,
        },
      });

      if (!space) {
        throw new Error("Espaço não encontrado");
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
      billingPeriod: billingPeriod || "monthly",
      dateNextPayment: startOfDay(dateNextPayment),
      dayDue: new Date(dateNextPayment).getDate(),
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
        isDeleted: false,
      },
    });

    if (!professional) {
      throw new Error("Profissional não encontrado");
    }

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

    const getStatus = (clientId, dateNextPayment) => {
      if (!clientId) return "registration_pending";

      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);
      const paymentDate = startOfDay(dateNextPayment);

      if (isBefore(paymentDate, today)) return "overdue"; // Data já passou
      if (isEqual(paymentDate, today) || isEqual(paymentDate, tomorrow))
        return "awaiting_payment"; // Hoje ou amanhã
      return "active"; // Data futura
    };

    const clientProfessional = await prismaClient.clientsProfessional.create({
      data: {
        ...data,
        status: getStatus(data["clientId"], dateNextPayment),
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
    const valuePaid = valueClientAll * 1.012;

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

    if (clientProfessional.clientId) {
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

      if (clientProfessional.status != "active") {
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
                  expires_at: addYears(new Date(), 1),
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
                    recipient_id: "re_cm6b5djbg7lho0l9tx4wau5zy",
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
                clientProfessionalId: clientProfessional.id,
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
          .catch((error) => {
            throw new Error("Ocorreu um erro ao criar cobrança");
          });
      }

      return clientProfessional;
    }
  }
}

export { CreateClientProfessionalService };
