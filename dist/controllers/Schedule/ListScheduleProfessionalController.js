"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListScheduleProfessionalController = void 0;
var _ListScheduleProfessionalService = require("../../services/Schedule/ListScheduleProfessionalService");
class ListScheduleProfessionalController {
  async handle(req, res) {
    const userId = req.userId;
    const listScheduleProfessionalService = new _ListScheduleProfessionalService.ListScheduleProfessionalService();
    const schedule = await listScheduleProfessionalService.execute({
      userId
    });
    return res.json(schedule);
  }
}
exports.ListScheduleProfessionalController = ListScheduleProfessionalController;