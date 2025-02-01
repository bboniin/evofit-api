"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateProfessionalController = void 0;
var _CreateProfessionalService = require("../../services/Professional/CreateProfessionalService");
class CreateProfessionalController {
  async handle(req, res) {
    const {
      name,
      email,
      phoneNumber,
      password,
      birthday,
      cref,
      typeUser,
      cpfOrCnpj,
      description
    } = req.body;
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    const createProfessionalService = new _CreateProfessionalService.CreateProfessionalService();
    const professional = await createProfessionalService.execute({
      name,
      email,
      password,
      phoneNumber,
      birthday,
      photo,
      cref,
      typeUser,
      cpfOrCnpj,
      description
    });
    if (professional["photo"]) {
      professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + professional["photo"];
    }
    return res.json(professional);
  }
}
exports.CreateProfessionalController = CreateProfessionalController;