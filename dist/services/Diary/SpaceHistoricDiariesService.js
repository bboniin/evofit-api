"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpaceHistoricDiariesService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class SpaceHistoricDiariesService {
  async execute({
    userId
  }) {
    const diaries = await _prisma.default.diary.findMany({
      where: {
        spaceId: userId,
        used: true
      },
      include: {
        client: true
      }
    });
    return diaries;
  }
}
exports.SpaceHistoricDiariesService = SpaceHistoricDiariesService;