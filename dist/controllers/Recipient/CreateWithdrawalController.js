"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateWithdrawalController = void 0;
var _CreateWithdrawalService = require("../../services/Recipient/CreateWithdrawalService");
class CreateWithdrawalController {
  async handle(req, res) {
    const {
      value
    } = req.body;
    const createWithdrawalService = new _CreateWithdrawalService.CreateWithdrawalService();
    const userId = req.userId;
    const recipient = await createWithdrawalService.execute({
      value,
      userId
    });
    return res.json(recipient);
  }
}
exports.CreateWithdrawalController = CreateWithdrawalController;