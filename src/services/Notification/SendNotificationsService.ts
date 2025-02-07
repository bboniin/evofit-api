import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";

class SendNotificationsService {
  async execute() {
    const date = new Date();

    const hours = date.getHours();

    const client = new OneSignal.Client(
      "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
      "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
    );

    if (hours == 13) {
      const clients = await prismaClient.client.findMany({
        where: {
          photo: { not: null },
          isDeleted: false,
        },
      });

      Promise.all(
        clients.map(async (item) => {
          await client.createNotification({
            headings: {
              en: "Lembrete!",
              pt: "Lembrete!",
            },
            contents: {
              en: "Complete seu perfil",
              pt: "Complete seu perfil",
            },
            include_external_user_ids: [item.id],
          });

          await prismaClient.notification.create({
            data: {
              title: "Lembrete!",
              message: "Complete seu perfil",
              type: "ViewProfile",
              dataId: "",
              userId: item.id,
            },
          });
        })
      );

      const professionals = await prismaClient.professional.findMany({
        where: {
          isDeleted: false,
          OR: [
            {
              spaces: { none: {} },
            },
            {
              finishProfile: false,
            },
            {
              recipientId: { not: null },
            },
          ],
        },
      });

      Promise.all(
        professionals.map(async (item) => {
          await client.createNotification({
            headings: {
              en: "Importante!",
              pt: "Importante!",
            },
            contents: {
              en: "Conclua seu cadastro para ficar visível para novos clientes.",
              pt: "Conclua seu cadastro para ficar visível para novos clientes.",
            },
            include_external_user_ids: [item.id],
          });

          await prismaClient.notification.create({
            data: {
              title: "Importante!",
              message:
                "Conclua seu cadastro para ficar visível para novos clientes.",
              type: "ViewProfile",
              dataId: "",
              userId: item.id,
            },
          });
        })
      );

      const spaces = await prismaClient.space.findMany({
        where: {
          userId: { not: null },
          isDeleted: false,
          OR: [
            {
              spaceHours: { none: {} },
            },
            {
              finishProfile: false,
            },
            {
              recipientId: { not: null },
            },
          ],
        },
      });

      Promise.all(
        spaces.map(async (item) => {
          await client.createNotification({
            headings: {
              en: "Importante!",
              pt: "Importante!",
            },
            contents: {
              en: "Conclua seu cadastro para ficar visível para novos clientes.",
              pt: "Conclua seu cadastro para ficar visível para novos clientes.",
            },
            include_external_user_ids: [item.id],
          });

          await prismaClient.notification.create({
            data: {
              title: "Importante!",
              message:
                "Conclua seu cadastro para ficar visível para novos clientes.",
              type: "ViewProfile",
              dataId: "",
              userId: item.id,
            },
          });
        })
      );
    } else {
      const professionals = await prismaClient.professional.findMany({
        where: {
          spaces: { some: {} },
          finishProfile: true,
          OR: [
            { recipientStatus: "registration" },
            { recipientStatus: "affiliation" },
            { recipientStatus: "active" },
          ],
          isDeleted: false,
        },
      });

      Promise.all(
        professionals.map(async (item) => {
          if (Math.random() < 0.65) {
            await client.createNotification({
              headings: {
                en: "Aviso!",
                pt: "Aviso!",
              },
              contents: {
                en: "Seu perfil foi visualizado hoje por futuros clientes 🔥",
                pt: "Seu perfil foi visualizado hoje por futuros clientes 🔥",
              },
              include_external_user_ids: [item.id],
            });

            await prismaClient.notification.create({
              data: {
                title: "Aviso!",
                message:
                  "Seu perfil foi visualizado hoje por futuros clientes 🔥",
                type: "ViewProfile",
                dataId: "",
                userId: item.id,
              },
            });
          }
        })
      );
    }
  }
}

export { SendNotificationsService };
