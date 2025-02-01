"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditClientController = void 0;
var _EditClientService = require("../../services/Client/EditClientService");
class EditClientController {
  async handle(req, res) {
    const {
      name,
      birthday,
      phoneNumber,
      cpf,
      objective,
      experienceLevel,
      email
    } = req.body;
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    let userId = req.userId;
    const editClientService = new _EditClientService.EditClientService();
    const client = await editClientService.execute({
      name,
      birthday,
      phoneNumber,
      cpf,
      objective,
      experienceLevel,
      photo,
      email,
      userId
    });
    if (client["photo"]) {
      client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + client["photo"];
    }
    return res.json(client);
  }
}
exports.EditClientController = EditClientController;