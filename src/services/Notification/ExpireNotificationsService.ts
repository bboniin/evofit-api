import prismaClient from "../../prisma";

class ExpireNotificationsService {
  async execute() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log(sevenDaysAgo);

    const deotifications = await prismaClient.notification.findMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    console.log(deotifications);

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
