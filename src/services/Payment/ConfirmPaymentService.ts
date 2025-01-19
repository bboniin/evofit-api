import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";

interface OrderRequest {
  data: object;
}

const client = new OneSignal.Client(
  "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
  "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
);

async function sendNotification(title, text, userId, payment, type) {
  await client.createNotification({
    headings: {
      en: title,
      pt: title,
    },
    contents: {
      en: text,
      pt: text,
    },
    data: {
      screen: type == "client" ? "PaymentClient" : "Payment",
      params: {
        id: payment.id,
      },
    },
    include_external_user_ids: [userId],
  });

  await prismaClient.notification.create({
    data: {
      title: title,
      message: text,
      type: type == "client" ? "PaymentClient" : "Payment",
      dataId: payment.id,
      userId: userId,
    },
  });
}

class ConfirmPaymentService {
  async execute({ data }: OrderRequest) {
    const payment = await prismaClient.payment.findUnique({
      where: {
        orderId: data["data"]["id"],
      },
      include: {
        client: true,
        professional: true,
        space: true,
        items: true,
      },
    });

    if (!payment) {
      throw new Error("Pagamento não encontrado");
    }

    const type = payment.items.length == 2 ? "multiple" : payment.items[0].type;

    if (type == "recurring") {
      await prismaClient.clientsProfessional.update({
        where: {
          professionalId_clientId: {
            professionalId: payment.professionalId,
            clientId: payment.clientId,
          },
        },
        data: {
          status: "active",
          visible: true,
        },
      });
      await sendNotification(
        "Pagamento confirmado",
        `Pagamento realizado com sucesso`,
        payment.clientId,
        payment,
        "client"
      );
      await sendNotification(
        "Pagamento confirmado",
        `${payment.client.name.toUpperCase()} pagou a mensalidade`,
        payment.professionalId,
        payment,
        "professional"
      );
    } else {
      if (type == "lesson") {
        await sendNotification(
          "Pedido confirmado",
          "Sua aula está confirmada",
          payment.clientId,
          payment,
          "client"
        );

        await sendNotification(
          "Pagamento confirmado",
          `${payment.client.name.toUpperCase()} confirmou sua reserva`,
          payment.professionalId,
          payment,
          "professional"
        );
        await prismaClient.booking.updateMany({
          where: {
            paymentId: payment.id,
          },
          data: {
            status: "confirmed",
          },
        });
      } else {
        if (type == "diary") {
          await sendNotification(
            "Pedido confirmado",
            "Suas diárias estão confirmadas",
            payment.clientId,
            payment,
            "client"
          );

          await sendNotification(
            "Pagamento confirmado",
            `${payment.client.name.toUpperCase()} confirmou suas diárias`,
            payment.spaceId,
            payment,
            "space"
          );

          for (let i = 0; i < payment.items[0].amount; i++) {
            await prismaClient.diary.create({
              data: {
                spaceId: payment.space.id,
                clientId: payment.client.id,
                itemId: payment.items[0].id,
                used: false,
              },
            });
          }
        } else {
          await sendNotification(
            "Pedido confirmado",
            "Sua aula pessoal e diária estão confirmadas",
            payment.clientId,
            payment,
            "client"
          );

          await sendNotification(
            "Pagamento confirmado",
            `${payment.client.name.toUpperCase()} confirmou sua diária`,
            payment.spaceId,
            payment,
            "space"
          );

          await sendNotification(
            "Pagamento confirmado",
            `${payment.client.name.toUpperCase()} confirmou sua reserva`,
            payment.professionalId,
            payment,
            "professional"
          );

          await prismaClient.booking.updateMany({
            where: {
              paymentId: payment.id,
            },
            data: {
              status: "confirmed",
            },
          });

          await prismaClient.diary.create({
            data: {
              spaceId: payment.space.id,
              clientId: payment.client.id,
              itemId: payment.items.find((data) => data.type == "diary").id,
              used: false,
            },
          });
        }
      }
    }

    await prismaClient.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "paid",
      },
    });

    return data;
  }
}

export { ConfirmPaymentService };
