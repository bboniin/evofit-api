"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetWithdrawalsController = void 0;
var _GetWithdrawalsService = require("../../services/Recipient/GetWithdrawalsService");
class GetWithdrawalsController {
  async handle(req, res) {
    const getWithdrawalsService = new _GetWithdrawalsService.GetWithdrawalsService();
    const userId = req.userId;
    const recipient = await getWithdrawalsService.execute({
      userId
    });
    return res.json(recipient);
  }
}
exports.GetWithdrawalsController = GetWithdrawalsController;