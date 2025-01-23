import { addDays, differenceInSeconds, getDate } from "date-fns";
import api from "../../config/api";
import prismaClient from "../../prisma";

interface ClientRequest {
  userId: string;
  professionalId: string;
}

class BuyConsultancyService {
  async execute({ professionalId, userId }: ClientRequest) {
    if (!professionalId || !userId) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        client: true,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const clientProfessionalAlreadyExists =
      await prismaClient.clientsProfessional.findFirst({
        where: {
          OR: [
            {
              email: user.email,
            },
            {
              clientId: user.id,
            },
          ],
          professionalId: professionalId,
          status: {
            not: "cancelled",
          },
        },
      });

    if (clientProfessionalAlreadyExists) {
      throw new Error("Você já é aluno desse personal");
    }

    const professional = await prismaClient.professional.findFirst({
      where: {
        id: professionalId,
      },
    });

    if (!professional) {
      throw new Error("Profissional não encontrado");
    }

    const valueClientAll = professional.valueConsultancy * 100;
    const valuePaid = valueClientAll * 1.012;

    let order = {};

    await api
      .post("/orders", {
        closed: true,
        items: [
          {
            amount: valuePaid,
            description: `Adesão Consultoria`,
            quantity: 1,
            code: 1,
          },
        ],
        customer: {
          name: user.client.name,
          type: "individual",
          document: user.client.cpf,
          email: user.email,
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
        order = await prismaClient.payment.create({
          data: {
            description: `Adesão Consultoria`,
            professionalId: professionalId,
            clientId: user.client.id,
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
                  value: professional.valueConsultancy,
                  amount: 1,
                },
              ],
            },
          },
        });

        const day = getDate(new Date()) + 5;

        await prismaClient.clientsProfessional.create({
          data: {
            name: user.client.name,
            email: user.email,
            phoneNumber: user.client.phoneNumber,
            value: professional.valueConsultancy,
            professionalId: professionalId,
            clientId: user.id,
            consultancy: true,
            dayDue: day > 28 ? day - 28 : day,
            status: "awaiting_payment",
          },
        });
      })
      .catch((e) => {
        throw new Error("Ocorreu um erro ao criar cobrança");
      });

    return order;
  }
}

export { BuyConsultancyService };
