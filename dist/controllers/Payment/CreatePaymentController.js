"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreatePaymentController = void 0;
var _CreatePaymentService = require("../../services/Payment/CreatePaymentService");
class CreatePaymentController {
  async handle(req, res) {
    const createPaymentService = new _CreatePaymentService.CreatePaymentService();
    const data = await createPaymentService.execute({
      data: req.body
    });
    return res.json(data);
  }
}
exports.CreatePaymentController = CreatePaymentController;