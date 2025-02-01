"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfirmPaymentController = void 0;
var _ConfirmPaymentService = require("../../services/Payment/ConfirmPaymentService");
class ConfirmPaymentController {
  async handle(req, res) {
    const confirmPaymentService = new _ConfirmPaymentService.ConfirmPaymentService();
    const data = await confirmPaymentService.execute({
      data: req.body
    });
    return res.json(data);
  }
}
exports.ConfirmPaymentController = ConfirmPaymentController;