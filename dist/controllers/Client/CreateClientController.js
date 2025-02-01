"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateClientController = void 0;
var _CreateClientService = require("../../services/Client/CreateClientService");
class CreateClientController {
  async handle(req, res) {
    const {
      name,
      password,
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
    const createClientService = new _CreateClientService.CreateClientService();
    const client = await createClientService.execute({
      name,
      password,
      birthday,
      phoneNumber,
      cpf,
      objective,
      experienceLevel,
      photo,
      email
    });
    if (client["photo"]) {
      client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + client["photo"];
    }
    return res.json(client);
  }
}
exports.CreateClientController = CreateClientController;