"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListClientsProfessionalController = void 0;
var _ListClientsProfessionalService = require("../../services/ClientProfessional/ListClientsProfessionalService");
class ListClientsProfessionalController {
  async handle(req, res) {
    const userId = req.userId;
    const listClientsProfessionalService = new _ListClientsProfessionalService.ListClientsProfessionalService();
    const clientsProfessional = await listClientsProfessionalService.execute({
      userId
    });
    clientsProfessional.map(item => {
      if (item.client?.photo) {
        item.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.client.photo;
      }
    });
    return res.json(clientsProfessional);
  }
}
exports.ListClientsProfessionalController = ListClientsProfessionalController;