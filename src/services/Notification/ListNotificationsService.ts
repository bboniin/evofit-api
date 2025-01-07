import prismaClient from "../../prisma";

interface NotificationRequest {
  userId: string;
}

class ListNotificationsService {
  async execute({ userId }: NotificationRequest) {
    const notifications = await prismaClient.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  }
}

export { ListNotificationsService };
