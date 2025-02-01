"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientHistoricDiariesService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ClientHistoricDiariesService {
  async execute({
    userId
  }) {
    const diaries = await _prisma.default.diary.findMany({
      where: {
        clientId: userId,
        used: true
      },
      include: {
        space: true
      }
    });
    return diaries;
  }
}
exports.ClientHistoricDiariesService = ClientHistoricDiariesService;