import prismaClient from "../../prisma";

interface ScheduleRequest {
  userId: string;
}

class HistoricLessonService {
  async execute({ userId }: ScheduleRequest) {
    const bookings = await prismaClient.booking.findMany({
      where: {
        clientId: userId,
        date: { lte: new Date() },
      },
      include: {
        professional: true,
      },
    });

    return bookings;
  }
}

export { HistoricLessonService };
