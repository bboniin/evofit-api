import prismaClient from "../../prisma";

class CreateBookingDayService {
  async execute() {
    const dayOfWeek = new Date().getDay();

    const schedules = await prismaClient.schedule.findMany({
      where: {
        recurring: true,
        dayOfWeek,
        clientProfessional: {
          OR: [
            {
              status: "active",
            },
            {
              status: "overdue",
            },
          ],
        },
      },
      include: {
        clientProfessional: {
          include: {
            client: true,
            space: true,
          },
        },
      },
    });

    Promise.all(
      schedules.map(async (item) => {
        await prismaClient.booking.create({
          data: {
            professionalId: item.professionalId,
            clientId: item.clientProfessional.client.id,
            startTime: item.startTime,
            date: new Date(),
            endTime: item.endTime,
            spaceId: item.clientProfessional.spaceId,
            status: "confirmed",
          },
        });
      })
    );
  }
}

export { CreateBookingDayService };
