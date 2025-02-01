"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoRemoveProfessionalController = void 0;
var _PhotoRemoveProfessionalService = require("../../services/Professional/PhotoRemoveProfessionalService");
class PhotoRemoveProfessionalController {
  async handle(req, res) {
    const {
      id
    } = req.params;
    let userId = req.userId;
    const photoRemoveProfessionalService = new _PhotoRemoveProfessionalService.PhotoRemoveProfessionalService();
    const photoProfessional = await photoRemoveProfessionalService.execute({
      id,
      userId
    });
    if (photoProfessional["photo"]) {
      photoProfessional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoProfessional["photo"];
    }
    return res.json(photoProfessional);
  }
}
exports.PhotoRemoveProfessionalController = PhotoRemoveProfessionalController;