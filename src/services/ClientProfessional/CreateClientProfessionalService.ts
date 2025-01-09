import { addDays } from "date-fns";
import api from "../../config/api";
import prismaClient from "../../prisma";

interface ClientRequest {
  name: string;
  phoneNumber: string;
  email: string;
  academy: string;
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
    academy,
    value,
    dayDue,
    schedule,
  }: ClientRequest) {
    if (
      !name ||
      !phoneNumber ||
      !professionalId ||
      (!consultancy && !academy) ||
      !value ||
      !dayDue ||
      !email ||
      (!consultancy && !schedule.length)
    ) {
      throw new Error("Todos os campos são obrigatórios");
    }

    let data = {
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      academy: academy,
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

    if (userAlreadyExists) {
      throw new Error("Email já está sendo usado por outro tipo de usuário");
    }

    const clientAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    if (clientAlreadyExists) {
      data["clientId"] = clientAlreadyExists.id;
      data["status"] = "awaiting_payment";

      const clientProfessionalAlreadyExists =
        await prismaClient.clientsProfessional.findFirst({
          where: {
            clientId: clientAlreadyExists.id,
            professionalId: professionalId,
          },
        });

      if (clientProfessionalAlreadyExists) {
        throw new Error("Você já cadastrou um aluno usando esse email");
      }
    }

    const clientProfessional = await prismaClient.clientsProfessional.create({
      data: {
        ...data,
        status: data["clientId"] ? "awaiting_payment" : "awaiting_registration",
      },
      include: {
        client: {
          include: {
            user: true,
          },
        },
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
                expires_in: 259200,
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
              name: `Mensalidade ${consultancy ? "Consultoria" : "Personal"}`,
              professionalId: professionalId,
              clientId: clientProfessional.client.id,
              valueUnit: value,
              amount: 1,
              rate: (valuePaid - valueClientAll) / 100,
              type: "RECURRING",
              recurring: true,
              value: valueClientAll / 100,
              orderId: response.data.id,
              expireAt: addDays(new Date(), 3),
            },
          });

          return order;
        })
        .catch((e) => {
          console.log(e.response.data);
          throw new Error("Ocorreu um erro ao criar cobrança");
        });

      return clientProfessional;
    }
  }
}

export { CreateClientProfessionalService };
