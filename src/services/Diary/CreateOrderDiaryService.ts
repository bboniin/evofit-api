import { addMinutes } from "date-fns";
import api from "../../config/api";
import prismaClient from "../../prisma";

interface OrderDiaryRequest {
  spaceId: string;
  clientId: string;
  amount: number;
}

class CreateOrderDiaryService {
  async execute({ spaceId, clientId, amount }: OrderDiaryRequest) {
    const client = await prismaClient.client.findUnique({
      where: {
        userId: clientId,
      },
      include: {
        user: true,
      },
    });

    if (!client) {
      throw new Error("Cliente não encontrado");
    }

    const space = await prismaClient.space.findUnique({
      where: {
        userId: spaceId,
      },
    });

    if (!space) {
      throw new Error("Espaço não encontrado");
    }

    let order = {};

    const valueDiarieAll = space.valueDiarie * amount * 100;
    const valuePaid = valueDiarieAll * 1.02;

    await api
      .post("/orders", {
        closed: true,
        items: [
          {
            amount: valuePaid,
            description: "Diária Academia",
            quantity: 1,
            code: 1,
          },
        ],
        customer: {
          name: client.name,
          type: "individual",
          document: client.cpf,
          email: client.user.email,
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
              expires_in: 1800,
              additional_information: [
                {
                  name: "information",
                  value: "number",
                },
              ],
            },
            split: [
              {
                amount: valueDiarieAll,
                recipient_id: space.recipientId,
                type: "flat",
                options: {
                  charge_processing_fee: false,
                  charge_remainder_fee: false,
                  liable: false,
                },
              },
              {
                amount: valuePaid - valueDiarieAll,
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
            name: "Diária",
            spaceId,
            clientId: client.id,
            valueUnit: space.valueDiarie,
            amount: amount,
            type: "DIARY",
            rate: (valuePaid - valueDiarieAll) / 100,
            value: valueDiarieAll / 100,
            orderId: response.data.id,
            expireAt: addMinutes(new Date(), 30),
          },
        });

        for (let i = 0; i < amount; i++) {
          await prismaClient.diary.create({
            data: {
              spaceId: space.id,
              clientId: client.id,
              paymentId: order["id"],
              used: false,
            },
          });
        }
      })
      .catch((e) => {
        throw new Error("Ocorreu um erro ao criar cobrança");
      });

    return order;
  }
}

export { CreateOrderDiaryService };
