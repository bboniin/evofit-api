"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DayWeekScheduleProfessionalService = void 0;
var _dateFns = require("date-fns");
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DayWeekScheduleProfessionalService {
  async execute({
    dayWeek,
    isBlock,
    userId,
    clientId
  }) {
    const workSchedule = await _prisma.default.workSchedule.findUnique({
      where: {
        professionalId_dayOfWeek: {
          professionalId: userId,
          dayOfWeek: dayWeek
        }
      }
    });
    if (!workSchedule) {
      return [];
    }
    const startTime = new Date(`${(0, _dateFns.format)(new Date(), "yyyy-MM-dd")}T${workSchedule.startTime}`);
    const endTime = new Date(`${(0, _dateFns.format)(new Date(), "yyyy-MM-dd")}T${workSchedule.endTime}`);
    const schedules = await _prisma.default.schedule.findMany({
      where: {
        professionalId: userId,
        OR: [{
          recurring: true,
          dayOfWeek: dayWeek
        }],
        NOT: {
          clientProfessional: {
            id: clientId
          }
        },
        clientProfessional: {
          status: {
            not: "cancelled"
          }
        }
      }
    });
    const slots = [];
    let currentTime = new Date(startTime);
    while ((0, _dateFns.isBefore)(currentTime, endTime) || (0, _dateFns.isEqual)(currentTime, endTime)) {
      const nextTime = (0, _dateFns.addMinutes)(currentTime, 15);
      const slotEndTime = (0, _dateFns.addMinutes)(currentTime, 60);
      if (isBlock) {
        slots.push({
          startTime: (0, _dateFns.format)(currentTime, "HH:mm"),
          endTime: (0, _dateFns.format)(slotEndTime, "HH:mm"),
          available: true
        });
      } else {
        const isBlocked = schedules.some(schedule => (0, _dateFns.isAfter)(currentTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", new Date())) && (0, _dateFns.isBefore)(currentTime, (0, _dateFns.parse)(schedule.endTime, "HH:mm", new Date())) || (0, _dateFns.isAfter)(slotEndTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", new Date())) && (0, _dateFns.isBefore)(slotEndTime, (0, _dateFns.parse)(schedule.endTime, "HH:mm", new Date())));
        slots.push({
          startTime: (0, _dateFns.format)(currentTime, "HH:mm"),
          endTime: (0, _dateFns.format)(slotEndTime, "HH:mm"),
          available: !isBlocked
        });
      }
      currentTime = nextTime;
    }
    return slots;
  }
}
exports.DayWeekScheduleProfessionalService = DayWeekScheduleProfessionalService;