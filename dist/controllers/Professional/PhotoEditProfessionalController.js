"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoEditProfessionalController = void 0;
var _PhotoEditProfessionalService = require("../../services/Professional/PhotoEditProfessionalService");
class PhotoEditProfessionalController {
  async handle(req, res) {
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    let {
      id
    } = req.params;
    const photoEditProfessionalService = new _PhotoEditProfessionalService.PhotoEditProfessionalService();
    const photoProfessional = await photoEditProfessionalService.execute({
      id,
      photo
    });
    if (photoProfessional["photo"]) {
      photoProfessional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoProfessional["photo"];
    }
    return res.json(photoProfessional);
  }
}
exports.PhotoEditProfessionalController = PhotoEditProfessionalController;