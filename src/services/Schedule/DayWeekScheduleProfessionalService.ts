import {
  addMinutes,
  format,
  isBefore,
  isEqual,
  isAfter,
  parse,
  differenceInMinutes,
  endOfDay,
  startOfDay,
} from "date-fns";
import prismaClient from "../../prisma";

interface ScheduleRequest {
  dayWeek: number;
  userId: string;
  clientId: string;
  isBlock: boolean;
}

class DayWeekScheduleProfessionalService {
  async execute({ dayWeek, isBlock, userId, clientId }: ScheduleRequest) {
    const workSchedule = await prismaClient.workSchedule.findUnique({
      where: {
        professionalId_dayOfWeek: {
          professionalId: userId,
          dayOfWeek: dayWeek,
        },
      },
    });

    if (!workSchedule) {
      return [];
    }

    const startTime = new Date(
      `${format(new Date(), "yyyy-MM-dd")}T${workSchedule.startTime}`
    );
    const endTime = new Date(
      `${format(new Date(), "yyyy-MM-dd")}T${workSchedule.endTime}`
    );

    const schedules = await prismaClient.schedule.findMany({
      where: {
        professionalId: userId,
        OR: [{ recurring: true, dayOfWeek: dayWeek }],
        NOT: {
          clientProfessional: {
            id: clientId,
          },
        },
        clientProfessional: {
          status: "paid",
        },
      },
    });

    const slots = [];
    let currentTime = new Date(startTime);

    while (isBefore(currentTime, endTime) || isEqual(currentTime, endTime)) {
      const nextTime = addMinutes(currentTime, 15);
      const slotEndTime = addMinutes(currentTime, 60);

      if (isBlock) {
        slots.push({
          startTime: format(currentTime, "HH:mm"),
          endTime: format(slotEndTime, "HH:mm"),
          available: true,
        });
      } else {
        const isBlocked = schedules.some(
          (schedule) =>
            (isAfter(
              currentTime,
              parse(schedule.startTime, "HH:mm", new Date())
            ) &&
              isBefore(
                currentTime,
                parse(schedule.endTime, "HH:mm", new Date())
              )) ||
            (isAfter(
              slotEndTime,
              parse(schedule.startTime, "HH:mm", new Date())
            ) &&
              isBefore(
                slotEndTime,
                parse(schedule.endTime, "HH:mm", new Date())
              ))
        );

        slots.push({
          startTime: format(currentTime, "HH:mm"),
          endTime: format(slotEndTime, "HH:mm"),
          available: !isBlocked,
        });
      }

      currentTime = nextTime;
    }

    return slots;
  }
}

export { DayWeekScheduleProfessionalService };
