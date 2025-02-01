"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateSpaceController = void 0;
var _CreateSpaceService = require("../../services/Space/CreateSpaceService");
class CreateSpaceController {
  async handle(req, res) {
    const {
      name,
      password,
      city,
      state,
      zipCode,
      address,
      number,
      neighborhood,
      complement,
      phoneNumber,
      typeUser,
      cpfOrCnpj,
      latitude,
      longitude,
      description,
      email
    } = req.body;
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    const createSpaceService = new _CreateSpaceService.CreateSpaceService();
    const space = await createSpaceService.execute({
      name,
      password,
      city,
      state,
      zipCode,
      address,
      number,
      neighborhood,
      complement,
      phoneNumber,
      typeUser,
      cpfOrCnpj,
      latitude: Number(latitude),
      longitude: Number(longitude),
      description,
      email,
      photo
    });
    if (space["photo"]) {
      space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + space["photo"];
    }
    return res.json(space);
  }
}
exports.CreateSpaceController = CreateSpaceController;