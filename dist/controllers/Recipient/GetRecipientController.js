"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetRecipientController = void 0;
var _GetRecipientService = require("../../services/Recipient/GetRecipientService");
class GetRecipientController {
  async handle(req, res) {
    const {
      recipientId
    } = req.params;
    const getRecipientService = new _GetRecipientService.GetRecipientService();
    const userId = req.userId;
    const recipient = await getRecipientService.execute({
      recipientId,
      userId
    });
    return res.json(recipient);
  }
}
exports.GetRecipientController = GetRecipientController;