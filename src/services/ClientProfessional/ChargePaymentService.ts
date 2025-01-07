import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";
import { addHours, addMinutes, getDay } from "date-fns";
import api from "../../config/api";

class ChargePaymentService {
  async execute() {
    const day = getDay(new Date());

    const clients = await prismaClient.clientsProfessional.findMany({
      where: {
        dayDue: day + 1,
        status: "paid",
      },
      include: {
        professional: true,
        client: {
          include: {
            user: true,
          },
        },
      },
    });

    await prismaClient.clientsProfessional.updateMany({
      where: {
        dayDue: day - 1,
        status: "paid",
      },
      data: {
        status: "awaiting_payment",
      },
    });

    const clientOneSignal = new OneSignal.Client(
      "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
      "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
    );

    await Promise.all(
      clients.map(async (client) => {
        const valueClientAll = client.value * 100;
        const valuePaid = valueClientAll * 1.02;

        await api
          .post("/orders", {
            closed: true,
            items: [
              {
                amount: valuePaid,
                description: `Mensalidade ${
                  client.consultancy ? "Consultoria" : "Personal"
                }`,
                quantity: 1,
                code: 1,
              },
            ],
            customer: {
              name: client.name,
              type: "individual",
              document: client.client.cpf,
              email: client.client.user.email,
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
                  expires_in: 230400,
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
                    recipient_id: client.professional.recipientId,
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
            await prismaClient.payment.create({
              data: {
                name: "Mensalidade",
                professionalId: client.professionalId,
                clientId: client.id,
                valueUnit: client.value,
                amount: 1,
                type: "RECURRING",
                value: valueClientAll / 100,
                rate: (valuePaid - valueClientAll) / 100,
                orderId: response.data.id,
                expireAt: addHours(new Date(), 64),
              },
            });

            await clientOneSignal.createNotification({
              headings: {
                en: "Mensalidade pendente",
                pt: "Mensalidade pendente",
              },
              contents: {
                en: "Sua mensalidade vence amanhã",
                pt: "Sua mensalidade vence amanhã",
              },
              include_external_user_ids: [client.clientId],
            });
          })
          .catch((e) => {
            throw new Error("Ocorreu um erro ao criar cobrança");
          });
      })
    );
  }
}

export { ChargePaymentService };
