"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditScheduleProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class EditScheduleProfessionalService {
  async execute({
    dayOfWeek,
    startTime,
    endTime,
    userId
  }) {
    if (!dayOfWeek || !startTime || !endTime || !userId) {
      throw new Error("Todos os campos são obrigatórios");
    }
    const scheduleAlreadyExists = await _prisma.default.workSchedule.findFirst({
      where: {
        professionalId: userId,
        dayOfWeek: dayOfWeek - 1
      }
    });
    if (dayOfWeek > 7 || dayOfWeek < 1) {
      throw new Error("Dia da semana é inválido");
    }
    if (scheduleAlreadyExists) {
      const schedule = await _prisma.default.workSchedule.update({
        where: {
          id: scheduleAlreadyExists.id
        },
        data: {
          startTime: startTime,
          endTime: endTime
        }
      });
      return schedule;
    } else {
      const schedule = await _prisma.default.workSchedule.create({
        data: {
          professionalId: userId,
          dayOfWeek: dayOfWeek - 1,
          startTime: startTime,
          endTime: endTime
        }
      });
      return schedule;
    }
  }
}
exports.EditScheduleProfessionalService = EditScheduleProfessionalService;