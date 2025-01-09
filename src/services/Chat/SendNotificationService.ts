import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";

interface ChatRequest {
  message: object;
  recipientId: string;
}

class SendNotificationService {
  async execute({ message, recipientId }: ChatRequest) {
    const client = new OneSignal.Client(
      "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
      "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
    );

    await client.createNotification({
      headings: {
        en: "Nova mensagem",
        pt: "Nova mensagem",
      },
      contents: {
        en: message["content"],
        pt: message["content"],
      },
      data: {
        screen: "Chat",
        params: {
          id: message["id"],
        },
      },
      include_external_user_ids: [recipientId],
    });

    await prismaClient.notification.create({
      data: {
        title: "Nova mensagem",
        message: message["content"],
        type: "Chat",
        dataId: message["id"],
        userId: recipientId,
      },
    });

    return message;
  }
}

export { SendNotificationService };
