import {
  addMinutes,
  format,
  isBefore,
  isEqual,
  isAfter,
  parse,
  endOfDay,
  startOfDay,
} from "date-fns";
import prismaClient from "../../prisma";

interface ScheduleRequest {
  date: Date;
  professionalId: string;
}

class ClassesScheduleProfessionalService {
  async execute({ date, professionalId }: ScheduleRequest) {
    const dayOfWeek = date.getDay();

    const bookings = await prismaClient.booking.findMany({
      where: {
        professionalId,
        AND: [
          {
            date: { gte: startOfDay(date) },
          },
          {
            date: { lte: endOfDay(date) },
          },
        ],
      },
      include: {
        client: true,
      },
    });

    const schedules = await prismaClient.schedule.findMany({
      where: {
        professionalId,
        //id: {
        //  notIn: bookings.map((booking) => booking.scheduleId),
        //},
        OR: [{ recurring: true, dayOfWeek }, { date: date }],
        isBlock: false,
        createdAt: { lte: startOfDay(date) },
      },
      include: {
        clientProfessional: {
          include: {
            client: true,
          },
        },
      },
    });

    schedules.map((item) => {
      item["client"] = item["clientProfessional"]["client"] || {};
    });

    const classes = [...bookings, ...schedules].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    return classes;
  }
}

export { ClassesScheduleProfessionalService };
