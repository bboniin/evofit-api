import prismaClient from "../../prisma";

class ExpireNotificationsService {
  async execute() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deletedNotifications = await prismaClient.notification.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    return deletedNotifications;
  }
}

export { ExpireNotificationsService };
