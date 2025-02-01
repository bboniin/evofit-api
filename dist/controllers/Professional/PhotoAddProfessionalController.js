"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoAddProfessionalController = void 0;
var _PhotoAddProfessionalService = require("../../services/Professional/PhotoAddProfessionalService");
class PhotoAddProfessionalController {
  async handle(req, res) {
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    let userId = req.userId;
    const photoAddProfessionalService = new _PhotoAddProfessionalService.PhotoAddProfessionalService();
    const photoProfessional = await photoAddProfessionalService.execute({
      userId,
      photo
    });
    if (photoProfessional["photo"]) {
      photoProfessional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoProfessional["photo"];
    }
    return res.json(photoProfessional);
  }
}
exports.PhotoAddProfessionalController = PhotoAddProfessionalController;