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
        status: {
          not: "cancelled",
        },
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
        space: true,
      },
    });

    const schedules = await prismaClient.schedule.findMany({
      where: {
        professionalId,
        OR: [{ recurring: true, dayOfWeek }, { date: date }],
        createdAt: { lte: startOfDay(date) },
        AND: [
          {
            OR: [
              { clientProfessional: null },
              {
                clientProfessional: {
                  status: {
                    not: "cancelled",
                  },
                },
              },
            ],
          },
        ],
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

    schedules.map((item) => {
      if (item["clientProfessional"]) {
        item["client"] = item["clientProfessional"]["client"] || {};
      }
    });

    const classes = [...bookings, ...schedules].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    return classes;
  }
}

export { ClassesScheduleProfessionalService };
