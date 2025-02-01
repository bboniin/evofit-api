"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DayScheduleProfessionalController = void 0;
var _DayScheduleProfessionalService = require("../../services/Schedule/DayScheduleProfessionalService");
class DayScheduleProfessionalController {
  async handle(req, res) {
    const {
      professionalId
    } = req.params;
    const {
      date,
      user
    } = req.query;
    const dayScheduleProfessionalService = new _DayScheduleProfessionalService.DayScheduleProfessionalService();
    const schedule = await dayScheduleProfessionalService.execute({
      date: new Date(String(date)),
      professionalId,
      user: user == "true"
    });
    return res.json(schedule);
  }
}
exports.DayScheduleProfessionalController = DayScheduleProfessionalController;