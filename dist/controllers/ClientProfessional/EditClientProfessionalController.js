"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditClientProfessionalController = void 0;
var _EditClientProfessionalService = require("../../services/ClientProfessional/EditClientProfessionalService");
class EditClientProfessionalController {
  async handle(req, res) {
    const {
      name,
      spaceId,
      value,
      dayDue,
      schedule,
      email,
      consultancy,
      billingPeriod
    } = req.body;
    const {
      clientId
    } = req.params;
    const userId = req.userId;
    const editClientProfessionalService = new _EditClientProfessionalService.EditClientProfessionalService();
    const clientProfessional = await editClientProfessionalService.execute({
      clientId,
      name,
      spaceId,
      value,
      dayDue,
      schedule,
      professionalId: userId,
      email,
      consultancy,
      billingPeriod
    });
    return res.json(clientProfessional);
  }
}
exports.EditClientProfessionalController = EditClientProfessionalController;