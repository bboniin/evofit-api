import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";
import { getDate } from "date-fns";

class NotificationPaymentService {
  async execute() {
    const day = getDate(new Date());

    const clientsDayAfter = await prismaClient.clientsProfessional.findMany({
      where: {
        dayDue: day - 1,
        status: "awaiting_payment",
      },
    });

    const clientsToday = await prismaClient.clientsProfessional.findMany({
      where: {
        dayDue: day,
        status: "awaiting_payment",
      },
    });

    const clientOneSignal = new OneSignal.Client(
      "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
      "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
    );

    await Promise.all(
      clientsDayAfter.map(async (client) => {
        const payment = await prismaClient.payment.findFirst({
          where: {
            clientProfessionalId: client.id,
          },
          orderBy: {
            date: "desc",
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
          data: {
            screen: "PaymentClient",
            params: {
              id: payment.id,
            },
          },
          include_external_user_ids: [client.clientId],
        });

        await prismaClient.notification.create({
          data: {
            title: "Mensalidade pendente",
            message: "Sua mensalidade vence amanhã",
            type: "PaymentClient",
            dataId: payment.id,
            userId: client.clientId,
          },
        });
      })
    );

    await Promise.all(
      clientsToday.map(async (client) => {
        const payment = await prismaClient.payment.findFirst({
          where: {
            clientProfessionalId: client.id,
          },
          orderBy: {
            date: "desc",
          },
        });

        await clientOneSignal.createNotification({
          headings: {
            en: "Mensalidade vence hoje",
            pt: "Mensalidade vence hoje",
          },
          contents: {
            en: "Efetue o pagamento para evitar cancelamento",
            pt: "Efetue o pagamento para evitar cancelamento",
          },
          data: {
            screen: "PaymentClient",
            params: {
              id: payment.id,
            },
          },
          include_external_user_ids: [client.clientId],
        });
        await prismaClient.notification.create({
          data: {
            title: "Mensalidade vence hoje",
            message: "Efetue o pagamento para evitar cancelamento",
            type: "PaymentClient",
            dataId: payment.id,
            userId: client.clientId,
          },
        });
      })
    );

    const clientsOverdue = await prismaClient.clientsProfessional.findMany({
      where: {
        dayDue: day - 1,
        status: "overdue",
      },
    });

    await Promise.all(
      clientsOverdue.map(async (client) => {
        const payment = await prismaClient.payment.findFirst({
          where: {
            clientProfessionalId: client.id,
          },
          orderBy: {
            date: "desc",
          },
        });

        await clientOneSignal.createNotification({
          headings: {
            en: "Mensalidade está atrasada",
            pt: "Mensalidade está atrasada",
          },
          contents: {
            en: "Efetue o pagamento para evitar cancelamento",
            pt: "Efetue o pagamento para evitar cancelamento",
          },
          data: {
            screen: "PaymentClient",
            params: {
              id: payment.id,
            },
          },
          include_external_user_ids: [client.clientId],
        });
        await prismaClient.notification.create({
          data: {
            title: "Mensalidade está atrasada",
            message: "Efetue o pagamento para evitar cancelamento",
            type: "PaymentClient",
            dataId: payment.id,
            userId: client.clientId,
          },
        });
      })
    );
  }
}

export { NotificationPaymentService };
