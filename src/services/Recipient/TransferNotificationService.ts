import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";

interface RecipientRequest {
  data: object;
}

class TransferNotificationService {
  async execute({ data }: RecipientRequest) {
    const space = await prismaClient.space.findFirst({
      where: {
        recipientId: data["data"]["id"],
      },
    });

    const professional = await prismaClient.professional.findFirst({
      where: {
        recipientId: data["data"]["id"],
      },
    });

    if (!professional && !space) {
      throw new Error("Usuário não encontrado");
    }

    const user = professional || space;
    const userType = professional ? "professional" : "space";

    const client = new OneSignal.Client(
      "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
      "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
    );

    if (data["data"]["status"] == "active") {
      await client.createNotification({
        headings: {
          en: "Conta Bancaria Ativa",
          pt: "Conta Bancaria Ativa",
        },
        contents: {
          en: "Seus dados foram confirmados e agora você pode sacar",
          pt: "Seus dados foram confirmados e agora você pode sacar",
        },
        data: {
          screen: "Bank",
        },
        include_external_user_ids: [user.id],
      });

      await prismaClient.notification.create({
        data: {
          title: "Conta Bancaria Ativa",
          message: "Seus dados foram confirmados e agora você pode sacar",
          type: "Bank",
          dataId: "",
          userId: user.id,
        },
      });
      if (userType == "professional") {
        await prismaClient.professional.update({
          where: {
            id: user.id,
          },
          data: {
            recipientStatus: data["data"]["status"],
          },
        });
      } else {
        await prismaClient.space.update({
          where: {
            id: user.id,
          },
          data: {
            recipientStatus: data["data"]["status"],
          },
        });
      }
    } else {
      if (
        data["data"]["status"] != "registration" &&
        data["data"]["status"] != "affiliation"
      ) {
        await client.createNotification({
          headings: {
            en: "Conta Bancaria Recusada",
            pt: "Conta Bancaria Recusada",
          },
          contents: {
            en: "Seus dados foram rejeitados, entre em contato conosco para te ajudarmos",
            pt: "Seus dados foram rejeitados, entre em contato conosco para te ajudarmos",
          },
          data: {
            screen: "Bank",
          },
          include_external_user_ids: [user.id],
        });
        await prismaClient.notification.create({
          data: {
            title: "Conta Bancaria Recusad",
            message:
              "Seus dados foram rejeitados, entre em contato conosco para te ajudarmos",
            type: "Bank",
            dataId: "",
            userId: user.id,
          },
        });
        if (userType == "professional") {
          await prismaClient.professional.update({
            where: {
              id: user.id,
            },
            data: {
              recipientStatus: data["data"]["status"],
            },
          });
        } else {
          await prismaClient.space.update({
            where: {
              id: user.id,
            },
            data: {
              recipientStatus: data["data"]["status"],
            },
          });
        }
      }
    }

    return data;
  }
}

export { TransferNotificationService };
