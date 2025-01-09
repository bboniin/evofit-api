import prismaClient from "../../prisma";

interface NotificationRequest {
  userId: string;
}
class OpenNotificationsService {
  async execute({ userId }: NotificationRequest) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deletedNotifications = await prismaClient.notification.updateMany({
      where: {
        userId: userId,
      },
      data: {
        open: true,
        dateOpen: new Date(),
      },
    });

    return deletedNotifications;
  }
}

export { OpenNotificationsService };
