"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UsedDiaryService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class UsedDiaryService {
  async execute({
    diaryId
  }) {
    const diary = await _prisma.default.diary.findUnique({
      where: {
        id: diaryId
      }
    });
    if (!diary) {
      throw new Error("Diária não encontrada");
    }
    if (diary.used) {
      throw new Error("Diária já foi utilizada");
    }
    const order = await _prisma.default.diary.update({
      where: {
        id: diaryId
      },
      data: {
        used: true,
        dateUsed: new Date()
      }
    });
    return order;
  }
}
exports.UsedDiaryService = UsedDiaryService;