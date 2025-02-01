"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoveLinkedSpaceService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class RemoveLinkedSpaceService {
  async execute({
    id,
    userId
  }) {
    const professionalSpace = await _prisma.default.professionalSpace.findUnique({
      where: {
        id: id,
        professionalId: userId
      }
    });
    if (!professionalSpace) {
      throw new Error("Vinculação não encontrada");
    }
    await _prisma.default.professionalSpace.delete({
      where: {
        id: id
      }
    });
    return "Vinculação deletada com sucesso";
  }
}
exports.RemoveLinkedSpaceService = RemoveLinkedSpaceService;