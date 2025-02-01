"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditProfessionalController = void 0;
var _EditProfessionalService = require("../../services/Professional/EditProfessionalService");
class EditProfessionalController {
  async handle(req, res) {
    const {
      name,
      birthday,
      phoneNumber,
      email,
      cref,
      description,
      valueConsultancy,
      enableConsultancy,
      descriptionConsultancy,
      valueLesson,
      enableLesson,
      type
    } = req.body;
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    let userId = req.userId;
    const editProfessionalService = new _EditProfessionalService.EditProfessionalService();
    const professional = await editProfessionalService.execute({
      name,
      birthday,
      phoneNumber,
      email,
      cref,
      description,
      valueConsultancy: valueConsultancy ? Number(valueConsultancy) : 0,
      enableConsultancy: enableConsultancy == "true",
      descriptionConsultancy,
      valueLesson: valueLesson ? Number(valueLesson) : 0,
      enableLesson: enableLesson == "true",
      photo,
      userId,
      type
    });
    if (professional["photo"]) {
      professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + professional["photo"];
    }
    return res.json(professional);
  }
}
exports.EditProfessionalController = EditProfessionalController;