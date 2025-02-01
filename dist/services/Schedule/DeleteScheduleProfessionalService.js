"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeleteScheduleProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DeleteScheduleProfessionalService {
  async execute({
    scheduleId
  }) {
    const scheduleAlreadyExists = await _prisma.default.workSchedule.findFirst({
      where: {
        id: scheduleId
      }
    });
    if (!scheduleAlreadyExists) {
      throw new Error("Horário de trabalho não encontrado");
    }
    await _prisma.default.workSchedule.delete({
      where: {
        id: scheduleId
      }
    });
    await _prisma.default.schedule.deleteMany({
      where: {
        professionalId: scheduleAlreadyExists.professionalId,
        dayOfWeek: scheduleAlreadyExists.dayOfWeek,
        isBlock: true
      }
    });
    return "Deletado com sucesso";
  }
}
exports.DeleteScheduleProfessionalService = DeleteScheduleProfessionalService;