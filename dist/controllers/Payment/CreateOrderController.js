"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateOrderController = void 0;
var _CreateOrderService = require("../../services/Payment/CreateOrderService");
class CreateOrderController {
  async handle(req, res) {
    const {
      amount,
      spaceId,
      buyDiarie,
      professionalId,
      date,
      startTime,
      endTime
    } = req.body;
    const userId = req.userId;
    const createOrderService = new _CreateOrderService.CreateOrderService();
    const order = await createOrderService.execute({
      clientId: userId,
      spaceId,
      amount,
      professionalId,
      date,
      startTime,
      endTime,
      buyDiarie
    });
    return res.json(order);
  }
}
exports.CreateOrderController = CreateOrderController;