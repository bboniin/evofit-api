"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoListProfessionalController = void 0;
var _PhotoListProfessionalService = require("../../services/Professional/PhotoListProfessionalService");
class PhotoListProfessionalController {
  async handle(req, res) {
    let userId = req.userId;
    const photoListProfessionalService = new _PhotoListProfessionalService.PhotoListProfessionalService();
    const photosProfessional = await photoListProfessionalService.execute({
      userId
    });
    photosProfessional.map(item => {
      if (item["photo"]) {
        item["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
      }
    });
    return res.json(photosProfessional);
  }
}
exports.PhotoListProfessionalController = PhotoListProfessionalController;