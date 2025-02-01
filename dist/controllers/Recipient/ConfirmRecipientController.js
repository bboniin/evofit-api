"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfirmRecipientController = void 0;
var _ConfirmRecipientService = require("../../services/Recipient/ConfirmRecipientService");
class ConfirmRecipientController {
  async handle(req, res) {
    const {
      recipientId
    } = req.params;
    const confirmRecipientService = new _ConfirmRecipientService.ConfirmRecipientService();
    const userId = req.userId;
    const recipient = await confirmRecipientService.execute({
      recipientId,
      userId
    });
    return res.json(recipient);
  }
}
exports.ConfirmRecipientController = ConfirmRecipientController;