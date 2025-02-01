"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeleteClientProfessionalController = void 0;
var _DeleteClientProfessionalService = require("../../services/ClientProfessional/DeleteClientProfessionalService");
class DeleteClientProfessionalController {
  async handle(req, res) {
    const {
      clientId
    } = req.params;
    const userId = req.userId;
    const deleteClientProfessionalService = new _DeleteClientProfessionalService.DeleteClientProfessionalService();
    const clientProfessional = await deleteClientProfessionalService.execute({
      clientId,
      professionalId: userId
    });
    return res.json(clientProfessional);
  }
}
exports.DeleteClientProfessionalController = DeleteClientProfessionalController;