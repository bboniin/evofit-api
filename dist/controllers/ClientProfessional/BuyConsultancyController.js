"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuyConsultancyController = void 0;
var _BuyConsultancyService = require("../../services/ClientProfessional/BuyConsultancyService");
class BuyConsultancyController {
  async handle(req, res) {
    const {
      professionalId
    } = req.body;
    const userId = req.userId;
    const buyConsultancyService = new _BuyConsultancyService.BuyConsultancyService();
    const clientProfessional = await buyConsultancyService.execute({
      userId: userId,
      professionalId: professionalId
    });
    return res.json(clientProfessional);
  }
}
exports.BuyConsultancyController = BuyConsultancyController;