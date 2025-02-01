"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditBlockScheduleProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class EditBlockScheduleProfessionalService {
  async execute({
    professionalId,
    blockId,
    startTime,
    endTime,
    description
  }) {
    const blockGet = await _prisma.default.schedule.findUnique({
      where: {
        id: blockId,
        professionalId: professionalId,
        isBlock: true
      }
    });
    if (!blockGet) {
      throw new Error("Trava não encontrada");
    }
    const block = await _prisma.default.schedule.update({
      where: {
        id: blockId
      },
      data: {
        startTime: startTime,
        endTime: endTime,
        description: description
      }
    });
    return block;
  }
}
exports.EditBlockScheduleProfessionalService = EditBlockScheduleProfessionalService;