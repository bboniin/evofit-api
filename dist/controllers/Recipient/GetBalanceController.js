"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetBalanceController = void 0;
var _GetBalanceService = require("../../services/Recipient/GetBalanceService");
class GetBalanceController {
  async handle(req, res) {
    const getBalanceService = new _GetBalanceService.GetBalanceService();
    const userId = req.userId;
    const balance = await getBalanceService.execute({
      userId
    });
    balance.payments.map(item => {
      if (item.client?.photo) {
        item.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.client.photo;
      }
    });
    return res.json(balance);
  }
}
exports.GetBalanceController = GetBalanceController;