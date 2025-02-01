"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuyBookingController = void 0;
var _BuyBookingService = require("../../services/Booking/BuyBookingService");
class BuyBookingController {
  async handle(req, res) {
    const {
      professionalId,
      date,
      startTime,
      endTime
    } = req.body;
    const userId = req.userId;
    const buyBookingService = new _BuyBookingService.BuyBookingService();
    const booking = await buyBookingService.execute({
      clientId: userId,
      professionalId,
      date,
      startTime,
      endTime
    });
    return res.json(booking);
  }
}
exports.BuyBookingController = BuyBookingController;