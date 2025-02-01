"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateRecipientController = void 0;
var _CreateRecipientService = require("../../services/Recipient/CreateRecipientService");
class CreateRecipientController {
  async handle(req, res) {
    const {
      bank,
      branch,
      account,
      type,
      company_name,
      trading_name,
      name,
      cpf,
      birthday,
      address,
      neighborhood,
      number,
      zipCode,
      complement,
      state,
      city
    } = req.body;
    const createRecipientService = new _CreateRecipientService.CreateRecipientService();
    const userId = req.userId;
    const recipient = await createRecipientService.execute({
      bank,
      branch,
      account,
      type,
      company_name,
      trading_name,
      name,
      cpf,
      birthday,
      address,
      neighborhood,
      number,
      zipCode,
      complement,
      state,
      city,
      userId
    });
    return res.json(recipient);
  }
}
exports.CreateRecipientController = CreateRecipientController;