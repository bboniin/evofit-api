"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DayScheduleProfessionalService = void 0;
var _dateFns = require("date-fns");
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DayScheduleProfessionalService {
  async execute({
    date,
    professionalId,
    user
  }) {
    const dayOfWeek = date.getDay();
    const workSchedule = await _prisma.default.workSchedule.findUnique({
      where: {
        professionalId_dayOfWeek: {
          professionalId,
          dayOfWeek
        }
      }
    });
    if (!workSchedule) {
      return [];
    }
    const startTime = new Date(`${(0, _dateFns.format)(date, "yyyy-MM-dd")}T${workSchedule.startTime}`);
    const endTime = new Date(`${(0, _dateFns.format)(date, "yyyy-MM-dd")}T${workSchedule.endTime}`);
    const schedules = await _prisma.default.schedule.findMany({
      where: {
        professionalId,
        createdAt: {
          lte: (0, _dateFns.startOfDay)(date)
        },
        OR: [{
          recurring: true,
          dayOfWeek
        },
        // Recorrente no dia
        {
          date: date
        } // Específico para essa data
        ],
        AND: [{
          OR: [{
            clientProfessional: null
          }, {
            clientProfessional: {
              status: {
                not: "cancelled"
              }
            }
          }]
        }]
      }
    });
    const bookings = await _prisma.default.booking.findMany({
      where: {
        professionalId,
        startTime: {
          gte: workSchedule.startTime
        },
        status: {
          not: "cancelled"
        },
        endTime: {
          lte: workSchedule.endTime
        },
        AND: [{
          date: {
            gte: (0, _dateFns.startOfDay)(date)
          }
        }, {
          date: {
            lte: (0, _dateFns.endOfDay)(date)
          }
        }]
      }
    });
    const slots = [];
    let currentTime = new Date(startTime);
    while ((0, _dateFns.isBefore)(currentTime, endTime) || (0, _dateFns.isEqual)(currentTime, endTime)) {
      const nextTime = (0, _dateFns.addMinutes)(currentTime, 15); // Intervalo de 15 minutos para cada slot
      const slotEndTime = (0, _dateFns.addMinutes)(currentTime, 15);
      const slotEndTimeLesson = (0, _dateFns.addMinutes)(currentTime, 60); // Duração de 60 minutos para o slot

      if (user) {
        const isBlocked = schedules.some(schedule => ((0, _dateFns.isAfter)(currentTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", date)) || (0, _dateFns.isEqual)(currentTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", date))) && (0, _dateFns.isBefore)(currentTime, (0, _dateFns.parse)(schedule.endTime, "HH:mm", date)) || (0, _dateFns.isAfter)(slotEndTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", date)) && (0, _dateFns.isBefore)(slotEndTime, (0, _dateFns.parse)(schedule.endTime, "HH:mm", date)));
        const isBooked = bookings.some(booking => (0, _dateFns.isAfter)(currentTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date)) && (0, _dateFns.isBefore)(currentTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date)) ||
        // currentTime dentro do intervalo de booking
        (0, _dateFns.isAfter)(slotEndTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date)) && (0, _dateFns.isBefore)(slotEndTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date)) ||
        // slotEndTime dentro do intervalo de booking
        (0, _dateFns.isEqual)(currentTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date)) || (0, _dateFns.isEqual)(slotEndTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date)) ||
        // Slot começa ou termina exatamente no horário de booking
        (0, _dateFns.isAfter)(currentTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date)) && (0, _dateFns.isBefore)(slotEndTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date)) // Slot cobre o intervalo de booking
        );
        slots.push({
          startTime: (0, _dateFns.format)(currentTime, "HH:mm"),
          endTime: (0, _dateFns.format)(slotEndTime, "HH:mm"),
          available: isBooked || isBlocked
        });
      } else {
        // Verificar se o próximo slot tem pelo menos 60 minutos livres
        const nextSchedule = schedules.find(schedule => (0, _dateFns.isAfter)((0, _dateFns.parse)(schedule.startTime, "HH:mm", date), currentTime));
        const nextBooking = bookings.find(booking => (0, _dateFns.isAfter)((0, _dateFns.parse)(booking.startTime, "HH:mm", date), currentTime));

        // Combine as verificações
        const nextEventTime = nextSchedule ? (0, _dateFns.parse)(nextSchedule.startTime, "HH:mm", date) : null;
        const nextBookingTime = nextBooking ? (0, _dateFns.parse)(nextBooking.startTime, "HH:mm", date) : null;

        // Verificar se há pelo menos 60 minutos livres antes do próximo evento
        const hasEnoughTimeBeforeNext = nextEventTime && nextBookingTime ? (0, _dateFns.isBefore)((0, _dateFns.addMinutes)(currentTime, 45), nextEventTime) && (0, _dateFns.isBefore)((0, _dateFns.addMinutes)(currentTime, 45), nextBookingTime) : nextEventTime ? (0, _dateFns.isBefore)((0, _dateFns.addMinutes)(currentTime, 45), nextEventTime) : nextBookingTime ? (0, _dateFns.isBefore)((0, _dateFns.addMinutes)(currentTime, 45), nextBookingTime) : true;

        // Verificar se o slot está bloq

        const isBlocked = schedules.some(schedule => ((0, _dateFns.isAfter)(currentTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", date)) || (0, _dateFns.isEqual)(currentTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", date))) && (0, _dateFns.isBefore)(currentTime, (0, _dateFns.parse)(schedule.endTime, "HH:mm", date)) || (0, _dateFns.isAfter)(slotEndTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", date)) && (0, _dateFns.isBefore)(slotEndTime, (0, _dateFns.parse)(schedule.endTime, "HH:mm", date)));
        // Verificar se o slot está reservado (booked)
        const isBooked = bookings.some(booking => (0, _dateFns.isAfter)(currentTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date)) && (0, _dateFns.isBefore)(currentTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date)) ||
        // currentTime dentro do intervalo de booking
        (0, _dateFns.isAfter)(slotEndTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date)) && (0, _dateFns.isBefore)(slotEndTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date)) ||
        // slotEndTime dentro do intervalo de booking
        (0, _dateFns.isEqual)(currentTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date)) || (0, _dateFns.isEqual)(slotEndTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date)) ||
        // Slot começa ou termina exatamente no horário de booking
        (0, _dateFns.isAfter)(currentTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date)) && (0, _dateFns.isBefore)(slotEndTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date)) // Slot cobre o intervalo de booking
        );

        // Adicionar o slot se ele tiver pelo menos 60 minutos de espaço até o próximo horário
        if (!isBlocked && !isBooked && hasEnoughTimeBeforeNext && (0, _dateFns.isBefore)((0, _dateFns.addMinutes)(currentTime, 45), endTime)) {
          slots.push({
            startTime: (0, _dateFns.format)(currentTime, "HH:mm"),
            endTime: (0, _dateFns.format)(slotEndTimeLesson, "HH:mm")
          });
        }
      }
      currentTime = nextTime;
    }
    return slots;
  }
}
exports.DayScheduleProfessionalService = DayScheduleProfessionalService;