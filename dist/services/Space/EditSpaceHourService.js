"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditSpaceHourService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class EditSpaceHourService {
  async execute({
    startTime,
    endTime,
    id
  }) {
    if (!startTime || !endTime) {
      throw new Error("Horário de inicio e fim são obrigatórios");
    }
    await _prisma.default.spaceHours.update({
      where: {
        id: id
      },
      data: {
        startTime: startTime,
        endTime: endTime
      }
    });
  }
}
exports.EditSpaceHourService = EditSpaceHourService;