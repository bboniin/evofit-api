"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BlocksScheduleProfessionalController = void 0;
var _BlocksScheduleProfessionalService = require("../../services/Schedule/BlocksScheduleProfessionalService");
class BlocksScheduleProfessionalController {
  async handle(req, res) {
    const userId = req.userId;
    const blocksScheduleProfessionalService = new _BlocksScheduleProfessionalService.BlocksScheduleProfessionalService();
    const schedule = await blocksScheduleProfessionalService.execute({
      professionalId: userId
    });
    return res.json(schedule);
  }
}
exports.BlocksScheduleProfessionalController = BlocksScheduleProfessionalController;