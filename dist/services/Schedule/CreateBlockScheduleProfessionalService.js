"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateBlockScheduleProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateBlockScheduleProfessionalService {
  async execute({
    professionalId,
    dayOfWeek,
    startTime,
    endTime,
    recurring,
    date,
    description
  }) {
    const block = await _prisma.default.schedule.create({
      data: {
        professionalId: professionalId,
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        recurring: recurring,
        isBlock: true,
        description: description,
        date: recurring ? new Date() : new Date(date)
      }
    });
    return block;
  }
}
exports.CreateBlockScheduleProfessionalService = CreateBlockScheduleProfessionalService;