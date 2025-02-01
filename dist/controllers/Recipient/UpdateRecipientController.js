"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UpdateRecipientController = void 0;
var _UpdateRecipientService = require("../../services/Recipient/UpdateRecipientService");
class UpdateRecipientController {
  async handle(req, res) {
    const {
      bank,
      branch,
      account,
      type
    } = req.body;
    const updateRecipientService = new _UpdateRecipientService.UpdateRecipientService();
    const userId = req.userId;
    const recipient = await updateRecipientService.execute({
      bank,
      branch,
      account,
      type,
      userId
    });
    return res.json(recipient);
  }
}
exports.UpdateRecipientController = UpdateRecipientController;