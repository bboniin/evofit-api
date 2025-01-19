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
  user: boolean;
}

class DayScheduleProfessionalService {
  async execute({ date, professionalId, user }: ScheduleRequest) {
    const dayOfWeek = date.getDay();

    const workSchedule = await prismaClient.workSchedule.findUnique({
      where: { professionalId_dayOfWeek: { professionalId, dayOfWeek } },
    });

    if (!workSchedule) {
      return [];
    }

    const startTime = new Date(
      `${format(date, "yyyy-MM-dd")}T${workSchedule.startTime}`
    );
    const endTime = new Date(
      `${format(date, "yyyy-MM-dd")}T${workSchedule.endTime}`
    );

    const schedules = await prismaClient.schedule.findMany({
      where: {
        professionalId,
        createdAt: { lte: startOfDay(date) },
        OR: [
          { recurring: true, dayOfWeek }, // Recorrente no dia
          { date: date }, // Específico para essa data
        ],
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
    });

    const bookings = await prismaClient.booking.findMany({
      where: {
        professionalId,
        startTime: {
          gte: workSchedule.startTime,
        },
        status: {
          not: "cancelled",
        },
        endTime: {
          lte: workSchedule.endTime,
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
    });

    const slots = [];
    let currentTime = new Date(startTime);
    while (isBefore(currentTime, endTime) || isEqual(currentTime, endTime)) {
      const nextTime = addMinutes(currentTime, 15); // Intervalo de 15 minutos para cada slot
      const slotEndTime = addMinutes(currentTime, 15); // Duração de 60 minutos para o slot

      if (user) {
        const isBlocked = schedules.some(
          (schedule) =>
            ((isAfter(currentTime, parse(schedule.startTime, "HH:mm", date)) ||
              isEqual(currentTime, parse(schedule.startTime, "HH:mm", date))) &&
              isBefore(currentTime, parse(schedule.endTime, "HH:mm", date))) ||
            (isAfter(slotEndTime, parse(schedule.startTime, "HH:mm", date)) &&
              isBefore(slotEndTime, parse(schedule.endTime, "HH:mm", date)))
        );
        const isBooked = bookings.some(
          (booking) =>
            (isAfter(currentTime, parse(booking.startTime, "HH:mm", date)) &&
              isBefore(currentTime, parse(booking.endTime, "HH:mm", date))) || // currentTime dentro do intervalo de booking
            (isAfter(slotEndTime, parse(booking.startTime, "HH:mm", date)) &&
              isBefore(slotEndTime, parse(booking.endTime, "HH:mm", date))) || // slotEndTime dentro do intervalo de booking
            isEqual(currentTime, parse(booking.startTime, "HH:mm", date)) ||
            isEqual(slotEndTime, parse(booking.endTime, "HH:mm", date)) || // Slot começa ou termina exatamente no horário de booking
            (isAfter(currentTime, parse(booking.startTime, "HH:mm", date)) &&
              isBefore(slotEndTime, parse(booking.endTime, "HH:mm", date))) // Slot cobre o intervalo de booking
        );
        slots.push({
          startTime: format(currentTime, "HH:mm"),
          endTime: format(slotEndTime, "HH:mm"),
          available: isBooked || isBlocked,
        });
      } else {
        // Verificar se o próximo slot tem pelo menos 60 minutos livres
        const nextSchedule = schedules.find((schedule) =>
          isAfter(parse(schedule.startTime, "HH:mm", date), currentTime)
        );

        const nextBooking = bookings.find((booking) =>
          isAfter(parse(booking.startTime, "HH:mm", date), currentTime)
        );

        // Combine as verificações
        const nextEventTime = nextSchedule
          ? parse(nextSchedule.startTime, "HH:mm", date)
          : null;
        const nextBookingTime = nextBooking
          ? parse(nextBooking.startTime, "HH:mm", date)
          : null;

        // Verificar se há pelo menos 60 minutos livres antes do próximo evento
        const hasEnoughTimeBeforeNext =
          nextEventTime && nextBookingTime
            ? isBefore(addMinutes(currentTime, 45), nextEventTime) &&
              isBefore(addMinutes(currentTime, 45), nextBookingTime)
            : nextEventTime
            ? isBefore(addMinutes(currentTime, 45), nextEventTime)
            : nextBookingTime
            ? isBefore(addMinutes(currentTime, 45), nextBookingTime)
            : true;

        // Verificar se o slot está bloq

        const isBlocked = schedules.some(
          (schedule) =>
            ((isAfter(currentTime, parse(schedule.startTime, "HH:mm", date)) ||
              isEqual(currentTime, parse(schedule.startTime, "HH:mm", date))) &&
              isBefore(currentTime, parse(schedule.endTime, "HH:mm", date))) ||
            (isAfter(slotEndTime, parse(schedule.startTime, "HH:mm", date)) &&
              isBefore(slotEndTime, parse(schedule.endTime, "HH:mm", date)))
        );
        // Verificar se o slot está reservado (booked)
        const isBooked = bookings.some(
          (booking) =>
            (isAfter(currentTime, parse(booking.startTime, "HH:mm", date)) &&
              isBefore(currentTime, parse(booking.endTime, "HH:mm", date))) || // currentTime dentro do intervalo de booking
            (isAfter(slotEndTime, parse(booking.startTime, "HH:mm", date)) &&
              isBefore(slotEndTime, parse(booking.endTime, "HH:mm", date))) || // slotEndTime dentro do intervalo de booking
            isEqual(currentTime, parse(booking.startTime, "HH:mm", date)) ||
            isEqual(slotEndTime, parse(booking.endTime, "HH:mm", date)) || // Slot começa ou termina exatamente no horário de booking
            (isAfter(currentTime, parse(booking.startTime, "HH:mm", date)) &&
              isBefore(slotEndTime, parse(booking.endTime, "HH:mm", date))) // Slot cobre o intervalo de booking
        );

        // Adicionar o slot se ele tiver pelo menos 60 minutos de espaço até o próximo horário
        if (
          !isBlocked &&
          !isBooked &&
          hasEnoughTimeBeforeNext &&
          isBefore(addMinutes(currentTime, 45), endTime)
        ) {
          slots.push({
            startTime: format(currentTime, "HH:mm"),
            endTime: format(slotEndTime, "HH:mm"),
          });
        }
      }

      currentTime = nextTime;
    }

    return slots;
  }
}

export { DayScheduleProfessionalService };
