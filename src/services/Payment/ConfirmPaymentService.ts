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
      },
    });

    if (!payment) {
      throw new Error("Pagamento não encontrado");
    }

    if (payment.type == "RECURRING") {
      await sendNotification(
        "Pagamento confirmado",
        `Pagamento realizado com sucesso`,
        payment.clientId,
        payment,
        "client"
      );
      await sendNotification(
        "Pagamento confirmado",
        `${payment.client.name} pagou a mensalidade`,
        payment.professionalId,
        payment,
        "professional"
      );
    } else {
      if (payment.type == "LESSON") {
        await sendNotification(
          "Pedido confirmado",
          "Sua aula está confirmada",
          payment.clientId,
          payment,
          "client"
        );

        await sendNotification(
          "Pagamento confirmado",
          `${payment.client.name} confirmou sua reserva`,
          payment.professionalId,
          payment,
          "professional"
        );
        await prismaClient.booking.updateMany({
          where: {
            paymentId: payment.id,
          },
          data: {
            status: "confirm",
          },
        });
      } else {
        await sendNotification(
          "Pedido confirmado",
          "Suas diárias estão confirmadas",
          payment.clientId,
          payment,
          "client"
        );

        await sendNotification(
          "Pagamento confirmado",
          `${payment.client.name} confirmou suas diárias`,
          payment.spaceId,
          payment,
          "space"
        );
        await prismaClient.diary.updateMany({
          where: {
            paymentId: payment.id,
          },
          data: {
            status: "paid",
          },
        });
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
