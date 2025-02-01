"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HistoricLessonController = void 0;
var _HistoricLessonService = require("../../services/Schedule/HistoricLessonService");
class HistoricLessonController {
  async handle(req, res) {
    const userId = req.userId;
    const historicLessonService = new _HistoricLessonService.HistoricLessonService();
    const bookings = await historicLessonService.execute({
      userId: userId
    });
    bookings.map(item => {
      if (item["professional"]["photo"]) {
        item["professional"]["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["professional"]["photo"];
      }
    });
    return res.json(bookings);
  }
}
exports.HistoricLessonController = HistoricLessonController;