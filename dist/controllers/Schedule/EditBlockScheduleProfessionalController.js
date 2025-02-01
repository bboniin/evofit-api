"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditBlockScheduleProfessionalController = void 0;
var _EditBlockScheduleProfessionalService = require("../../services/Schedule/EditBlockScheduleProfessionalService");
class EditBlockScheduleProfessionalController {
  async handle(req, res) {
    const {
      startTime,
      endTime,
      description
    } = req.body;
    const {
      blockId
    } = req.params;
    const userId = req.userId;
    const editBlockScheduleProfessionalService = new _EditBlockScheduleProfessionalService.EditBlockScheduleProfessionalService();
    const block = await editBlockScheduleProfessionalService.execute({
      professionalId: userId,
      startTime,
      endTime,
      blockId,
      description
    });
    return res.json(block);
  }
}
exports.EditBlockScheduleProfessionalController = EditBlockScheduleProfessionalController;