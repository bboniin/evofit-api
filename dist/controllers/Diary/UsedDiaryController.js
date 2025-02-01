"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UsedDiaryController = void 0;
var _UsedDiaryService = require("../../services/Diary/UsedDiaryService");
class UsedDiaryController {
  async handle(req, res) {
    const {
      diaryId
    } = req.params;
    const usedDiaryService = new _UsedDiaryService.UsedDiaryService();
    const order = await usedDiaryService.execute({
      diaryId: diaryId
    });
    return res.json(order);
  }
}
exports.UsedDiaryController = UsedDiaryController;