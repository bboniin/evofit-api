"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetPaymentController = void 0;
var _GetPaymentService = require("../../services/Payment/GetPaymentService");
class GetPaymentController {
  async handle(req, res) {
    const getPaymentService = new _GetPaymentService.GetPaymentService();
    const {
      paymentId
    } = req.params;
    const userId = req.userId;
    const payment = await getPaymentService.execute({
      userId,
      paymentId
    });
    if (payment.space?.photo) {
      payment.space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + payment.space.photo;
    }
    if (payment.professional?.photo) {
      payment.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + payment.professional.photo;
    }
    if (payment.client?.photo) {
      payment.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + payment.client.photo;
    }
    return res.json(payment);
  }
}
exports.GetPaymentController = GetPaymentController;