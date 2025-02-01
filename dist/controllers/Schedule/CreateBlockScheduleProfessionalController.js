"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateBlockScheduleProfessionalController = void 0;
var _CreateBlockScheduleProfessionalService = require("../../services/Schedule/CreateBlockScheduleProfessionalService");
class CreateBlockScheduleProfessionalController {
  async handle(req, res) {
    const {
      startTime,
      endTime,
      dayOfWeek,
      date,
      recurring,
      description
    } = req.body;
    const userId = req.userId;
    const createBlockScheduleProfessionalService = new _CreateBlockScheduleProfessionalService.CreateBlockScheduleProfessionalService();
    const block = await createBlockScheduleProfessionalService.execute({
      professionalId: userId,
      startTime,
      endTime,
      dayOfWeek,
      date,
      recurring,
      description
    });
    return res.json(block);
  }
}
exports.CreateBlockScheduleProfessionalController = CreateBlockScheduleProfessionalController;