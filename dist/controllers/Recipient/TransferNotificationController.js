"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransferNotificationController = void 0;
var _TransferNotificationService = require("../../services/Recipient/TransferNotificationService");
class TransferNotificationController {
  async handle(req, res) {
    const transferNotificationService = new _TransferNotificationService.TransferNotificationService();
    const data = await transferNotificationService.execute({
      data: req.body
    });
    return res.json(data);
  }
}
exports.TransferNotificationController = TransferNotificationController;