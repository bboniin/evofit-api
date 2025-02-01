"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetClientProfessionalController = void 0;
var _GetClientProfessionalService = require("../../services/ClientProfessional/GetClientProfessionalService");
class GetClientProfessionalController {
  async handle(req, res) {
    const {
      clientId
    } = req.params;
    const userId = req.userId;
    const getClientProfessionalService = new _GetClientProfessionalService.GetClientProfessionalService();
    const clientProfessional = await getClientProfessionalService.execute({
      clientId,
      userId
    });
    if (clientProfessional.client?.photo) {
      clientProfessional.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + clientProfessional.client.photo;
    }
    return res.json(clientProfessional);
  }
}
exports.GetClientProfessionalController = GetClientProfessionalController;