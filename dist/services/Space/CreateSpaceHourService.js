"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateSpaceHourService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateSpaceHourService {
  async execute({
    dayOfWeek,
    startTime,
    endTime,
    userId
  }) {
    if (!startTime || !endTime) {
      throw new Error("Horário de inicio e fim são obrigatórios");
    }
    await _prisma.default.spaceHours.create({
      data: {
        spaceId: userId,
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime
      }
    });
  }
}
exports.CreateSpaceHourService = CreateSpaceHourService;