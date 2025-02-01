"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeleteScheduleProfessionalController = void 0;
var _DeleteScheduleProfessionalService = require("../../services/Schedule/DeleteScheduleProfessionalService");
class DeleteScheduleProfessionalController {
  async handle(req, res) {
    const {
      scheduleId
    } = req.params;
    const deleteScheduleProfessionalService = new _DeleteScheduleProfessionalService.DeleteScheduleProfessionalService();
    const schedule = await deleteScheduleProfessionalService.execute({
      scheduleId
    });
    return res.json(schedule);
  }
}
exports.DeleteScheduleProfessionalController = DeleteScheduleProfessionalController;