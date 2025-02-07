import prismaClient from "../../prisma";
import { addDays, addMonths, addYears, endOfDay, startOfDay } from "date-fns";
import api from "../../config/api";

class ChargePaymentService {
  async execute() {
    const date = new Date();

    const clients = await prismaClient.clientsProfessional.findMany({
      where: {
        AND: [
          {
            dateNextPayment: { gte: startOfDay(addDays(date, -1)) },
          },
          {
            dateNextPayment: { lte: endOfDay(addDays(date, 1)) },
          },
        ],
        clientId: {
          not: null,
        },
        status: {
          not: "cancelled",
        },
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
        AND: [
          {
            dateLastCharge: { gte: startOfDay(addDays(date, -1)) },
          },
          {
            dateLastCharge: { lte: endOfDay(addDays(date, -1)) },
          },
        ],
        status: "awaiting_payment",
      },
      data: {
        status: "overdue",
      },
    });

    await prismaClient.clientsProfessional.updateMany({
      where: {
        AND: [
          {
            dateNextPayment: { gte: startOfDay(addDays(date, 1)) },
          },
          {
            dateNextPayment: { lte: endOfDay(addDays(date, 1)) },
          },
        ],
        status: "active",
      },
      data: {
        status: "awaiting_payment",
      },
    });

    await Promise.all(
      clients.map(async (client) => {
        const valueClientAll = client.value * 100;
        const valuePaid = valueClientAll * 1.012;

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
                  expires_at: addYears(date, 1),
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
            await prismaClient.payment.create({
              data: {
                description: "Mensalidade",
                professionalId: client.professionalId,
                clientId: client.clientId,
                clientProfessionalId: client.id,
                recurring: true,
                type: "recurring",
                value: valueClientAll / 100,
                rate: (valuePaid - valueClientAll) / 100,
                orderId: response.data.id,
                expireAt: addDays(date, 3),
                items: {
                  create: [
                    {
                      type: "recurring",
                      amount: 1,
                      value: client.value,
                    },
                  ],
                },
              },
            });

            await prismaClient.clientsProfessional.update({
              where: {
                id: client.id,
              },
              data: {
                dateLastCharge: date,
                dateNextPayment: addMonths(
                  date.setDate(client.dayDue),
                  client.billingPeriod == "monthly"
                    ? 1
                    : client.billingPeriod == "quarterly"
                    ? 3
                    : 6
                ),
              },
            });
          })
          .catch((error) => {
            console.log(error.response.data);
          });
      })
    );
  }
}

export { ChargePaymentService };
