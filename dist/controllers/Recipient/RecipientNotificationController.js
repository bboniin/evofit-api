"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RecipientNotificationController = void 0;
var _RecipientNotificationService = require("../../services/Recipient/RecipientNotificationService");
class RecipientNotificationController {
  async handle(req, res) {
    const recipientNotificationService = new _RecipientNotificationService.RecipientNotificationService();
    const data = await recipientNotificationService.execute({
      data: req.body
    });
    return res.json(data);
  }
}
exports.RecipientNotificationController = RecipientNotificationController;