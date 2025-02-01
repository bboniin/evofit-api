"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DayWeekScheduleProfessionalController = void 0;
var _DayWeekScheduleProfessionalService = require("../../services/Schedule/DayWeekScheduleProfessionalService");
class DayWeekScheduleProfessionalController {
  async handle(req, res) {
    const {
      dayWeek
    } = req.params;
    const {
      clientId,
      isBlock
    } = req.query;
    const userId = req.userId;
    const dayWeekScheduleProfessionalService = new _DayWeekScheduleProfessionalService.DayWeekScheduleProfessionalService();
    const schedule = await dayWeekScheduleProfessionalService.execute({
      dayWeek: dayWeek ? Number(dayWeek) : -1,
      userId,
      isBlock: isBlock == "true",
      clientId: clientId ? String(clientId) : ""
    });
    return res.json(schedule);
  }
}
exports.DayWeekScheduleProfessionalController = DayWeekScheduleProfessionalController;