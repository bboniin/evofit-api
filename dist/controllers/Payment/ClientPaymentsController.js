"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientPaymentsController = void 0;
var _ClientPaymentsService = require("../../services/Payment/ClientPaymentsService");
class ClientPaymentsController {
  async handle(req, res) {
    const clientPaymentsService = new _ClientPaymentsService.ClientPaymentsService();
    const userId = req.userId;
    const payments = await clientPaymentsService.execute({
      userId
    });
    payments.map(item => {
      if (item.space?.photo) {
        item.space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.space.photo;
      }
      if (item.professional?.photo) {
        item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional.photo;
      }
    });
    return res.json(payments);
  }
}
exports.ClientPaymentsController = ClientPaymentsController;