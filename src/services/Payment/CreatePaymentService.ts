import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";
import { getValue } from "../../config/functions";

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

class CreatePaymentService {
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

    const type = payment.items.length == 2 ? "multiple" : payment.items[0].type;

    if (!payment) {
      throw new Error("Pagamento não encontrado");
    }

    if (type == "recurring") {
      await sendNotification(
        "Mensalidade Pendente",
        "Efetue o pagamento da mensalidade",
        payment.clientId,
        payment,
        "client"
      );
      await sendNotification(
        "Cobrança emitida",
        `${payment.client.name.toUpperCase()} no valor de ${getValue(
          payment.value
        )}`,
        payment.professionalId,
        payment,
        "professional"
      );
    } else {
      if (type == "lesson") {
        await sendNotification(
          "Pedido realizado",
          "Efetue o pagamento para confirmar sua aula",
          payment.clientId,
          payment,
          "client"
        );

        await sendNotification(
          "Novo pedido",
          `${payment.client.name.toUpperCase()} fez um pedido`,
          payment.professionalId,
          payment,
          "professional"
        );
      } else {
        if (type == "diary") {
          await sendNotification(
            "Pedido realizado",
            "Efetue o pagamento para confirmar suas diárias",
            payment.clientId,
            payment,
            "client"
          );

          await sendNotification(
            "Novo pedido",
            `${payment.client.name.toUpperCase()} fez um pedido`,
            payment.spaceId,
            payment,
            "space"
          );
        } else {
          await sendNotification(
            "Pedido realizado",
            "Efetue o pagamento para confirmar sua aula e diária",
            payment.clientId,
            payment,
            "client"
          );

          await sendNotification(
            "Novo pedido",
            `${payment.client.name.toUpperCase()} fez um pedido`,
            payment.spaceId,
            payment,
            "space"
          );
          await sendNotification(
            "Novo pedido",
            `${payment.client.name.toUpperCase()} fez um pedido`,
            payment.spaceId,
            payment,
            "space"
          );
        }
      }
    }

    return data;
  }
}

export { CreatePaymentService };
