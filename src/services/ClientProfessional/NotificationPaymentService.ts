import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";
import { addDays, endOfDay, getDate, startOfDay } from "date-fns";

class NotificationPaymentService {
  async execute() {
    const date = new Date();

    const clientOneSignal = new OneSignal.Client(
      "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
      "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
    );

    const clientsDayAfter = await prismaClient.clientsProfessional.findMany({
      where: {
        AND: [
          {
            dateLastCharge: { gte: startOfDay(date) },
          },
          {
            dateLastCharge: { lte: endOfDay(date) },
          },
        ],
        status: "awaiting_payment",
      },
      include: {
        professional: true,
      },
    });

    const clientsToday = await prismaClient.clientsProfessional.findMany({
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
      include: {
        professional: true,
      },
    });

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

        if (payment) {
          await clientOneSignal.createNotification({
            headings: {
              en: "Lembrete!",
              pt: "Lembrete!",
            },
            contents: {
              en: `Seu pagamento para ${client.professional.name.toUpperCase()} vence AMANHÃ.`,
              pt: `Seu pagamento para ${client.professional.name.toUpperCase()} vence AMANHÃ.`,
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
              title: "Lembrete!",
              message: `Seu pagamento para ${client.professional.name.toUpperCase()} vence AMANHÃ.`,
              type: "PaymentClient",
              dataId: payment.id,
              userId: client.clientId,
            },
          });
        }
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

        if (payment) {
          await clientOneSignal.createNotification({
            headings: {
              en: "Aviso!",
              pt: "Aviso!",
            },
            contents: {
              en: `Seu pagamento para ${client.professional.name.toUpperCase()} vence HOJE.`,
              pt: `Seu pagamento para ${client.professional.name.toUpperCase()} vence HOJE.`,
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
              title: "Aviso!",
              message: `Seu pagamento para ${client.professional.name.toUpperCase()} vence HOJE.`,
              type: "PaymentClient",
              dataId: payment.id,
              userId: client.clientId,
            },
          });
        }
      })
    );

    const clientsOverdue = await prismaClient.clientsProfessional.findMany({
      where: {
        AND: [
          {
            dateLastCharge: { gte: startOfDay(addDays(date, -2)) },
          },
          {
            dateLastCharge: { lte: endOfDay(addDays(date, -2)) },
          },
        ],
        status: "overdue",
      },
      include: {
        professional: true,
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

        if (payment) {
          await clientOneSignal.createNotification({
            headings: {
              en: "Aviso!",
              pt: "Aviso!",
            },
            contents: {
              en: `Seu pagamento para ${client.professional.name.toUpperCase()} está ATRASADO. 🚨`,
              pt: `Seu pagamento para ${client.professional.name.toUpperCase()} está ATRASADO. 🚨`,
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
              message: `Seu pagamento para ${client.professional.name.toUpperCase()} está ATRASADO. 🚨`,
              type: "PaymentClient",
              dataId: payment.id,
              userId: client.clientId,
            },
          });
        }
      })
    );
  }
}

export { NotificationPaymentService };
