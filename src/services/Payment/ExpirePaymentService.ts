import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";

class ExpirePaymentService {
  async execute() {
    const payments = await prismaClient.payment.findMany({
      where: {
        expireAt: {
          lte: new Date(),
        },
        status: "pending",
      },
    });

    await prismaClient.payment.updateMany({
      where: {
        AND: {
          expireAt: {
            lte: new Date(),
          },
          status: "pending",
        },
      },
      data: {
        status: "cancelled",
      },
    });

    const client = new OneSignal.Client(
      "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
      "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
    );

    payments.map(async (payment) => {
      if (payment.type == "RECURRING") {
        await prismaClient.clientsProfessional.update({
          where: {
            professionalId_clientId: {
              professionalId: payment.professionalId,
              clientId: payment.clientId,
            },
          },
          data: {
            status: "cancelled",
          },
        });

        await client.createNotification({
          headings: {
            en: "Mensalidade cancelada",
            pt: "Mensalidade cancelada",
          },
          contents: {
            en: "Por falta de pagamento, suas aulas com o personal foram suspensas",
            pt: "Por falta de pagamento, suas aulas com o personal foram suspensas",
          },
          data: {
            screen: "PaymentClient",
            params: {
              id: payment.id,
            },
          },
          include_external_user_ids: [payment.clientId],
        });
        await prismaClient.notification.create({
          data: {
            title: "Mensalidade cancelada",
            message:
              "Por falta de pagamento, suas aulas com o personal foram suspensas",
            type: "PaymentClient",
            dataId: payment.id,
            userId: payment.clientId,
          },
        });
      } else {
        if (payment.type == "DIARY") {
          await client.createNotification({
            headings: {
              en: "Pedido cancelado",
              pt: "Pedido cancelado",
            },
            contents: {
              en: "Por falta de pagamento o seu pedido foi cancelado",
              pt: "Por falta de pagamento o seu pedido foi cancelado",
            },
            data: {
              screen: "PaymentClient",
              params: {
                id: payment.id,
              },
            },
            include_external_user_ids: [payment.clientId],
          });

          await prismaClient.diary.updateMany({
            where: {
              paymentId: payment.id,
            },
            data: {
              status: "cancelled",
            },
          });

          await prismaClient.notification.create({
            data: {
              title: "Pedido cancelado",
              message: "Por falta de pagamento o seu pedido foi cancelado",
              type: "PaymentClient",
              dataId: payment.id,
              userId: payment.clientId,
            },
          });
        } else {
          await client.createNotification({
            headings: {
              en: "Pedido cancelado",
              pt: "Pedido cancelado",
            },
            contents: {
              en: "Por falta de pagamento o seu pedido foi cancelado",
              pt: "Por falta de pagamento o seu pedido foi cancelado",
            },
            data: {
              screen: "PaymentClient",
              params: {
                id: payment.id,
              },
            },
            include_external_user_ids: [payment.clientId],
          });
          await prismaClient.booking.update({
            where: {
              paymentId: payment.id,
            },
            data: {
              status: "cancelled",
            },
          });
          await prismaClient.notification.create({
            data: {
              title: "Pedido cancelado",
              message: "Por falta de pagamento o seu pedido foi cancelado",
              type: "PaymentClient",
              dataId: payment.id,
              userId: payment.clientId,
            },
          });
        }
      }
    });
  }
}

export { ExpirePaymentService };
