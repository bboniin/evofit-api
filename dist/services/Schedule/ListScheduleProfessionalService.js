"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListScheduleProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ListScheduleProfessionalService {
  async execute({
    userId
  }) {
    const schedule = await _prisma.default.workSchedule.findMany({
      where: {
        professionalId: userId
      },
      orderBy: {
        dayOfWeek: "asc"
      }
    });
    return schedule;
  }
}
exports.ListScheduleProfessionalService = ListScheduleProfessionalService;