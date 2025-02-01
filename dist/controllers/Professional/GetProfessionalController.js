"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetProfessionalController = void 0;
var _GetProfessionalService = require("../../services/Professional/GetProfessionalService");
class GetProfessionalController {
  async handle(req, res) {
    const {
      professionalId
    } = req.params;
    const getProfessionalService = new _GetProfessionalService.GetProfessionalService();
    const professional = await getProfessionalService.execute({
      professionalId
    });
    if (professional["photo"]) {
      professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + professional["photo"];
    }
    professional.photos.map(item => {
      if (item["photo"]) {
        item["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
      }
    });
    professional.clientsProfessional.map(item => {
      if (item["client"]["photo"]) {
        item["client"]["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["client"]["photo"];
      }
    });
    return res.json(professional);
  }
}
exports.GetProfessionalController = GetProfessionalController;