"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateClientProfessionalController = void 0;
var _CreateClientProfessionalService = require("../../services/ClientProfessional/CreateClientProfessionalService");
class CreateClientProfessionalController {
  async handle(req, res) {
    const {
      name,
      phoneNumber,
      email,
      spaceId,
      value,
      dayDue,
      consultancy,
      schedule,
      billingPeriod
    } = req.body;
    const userId = req.userId;
    const createClientProfessionalService = new _CreateClientProfessionalService.CreateClientProfessionalService();
    const clientProfessional = await createClientProfessionalService.execute({
      name,
      professionalId: userId,
      phoneNumber,
      email,
      spaceId,
      consultancy,
      value,
      dayDue,
      schedule,
      billingPeriod
    });
    return res.json(clientProfessional);
  }
}
exports.CreateClientProfessionalController = CreateClientProfessionalController;