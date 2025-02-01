"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditScheduleProfessionalController = void 0;
var _EditScheduleProfessionalService = require("../../services/Schedule/EditScheduleProfessionalService");
class EditScheduleProfessionalController {
  async handle(req, res) {
    const {
      dayOfWeek,
      startTime,
      endTime
    } = req.body;
    const userId = req.userId;
    const editScheduleProfessionalService = new _EditScheduleProfessionalService.EditScheduleProfessionalService();
    const scheduleEdit = await editScheduleProfessionalService.execute({
      dayOfWeek,
      startTime,
      endTime,
      userId
    });
    return res.json(scheduleEdit);
  }
}
exports.EditScheduleProfessionalController = EditScheduleProfessionalController;