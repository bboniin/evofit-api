"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RateBookingController = void 0;
var _RateBookingService = require("../../services/Booking/RateBookingService");
class RateBookingController {
  async handle(req, res) {
    const {
      bookingId
    } = req.params;
    const {
      status,
      rate,
      comment
    } = req.body;
    const rateBookingService = new _RateBookingService.RateBookingService();
    const rating = await rateBookingService.execute({
      bookingId,
      status,
      rate,
      comment
    });
    return res.json(rating);
  }
}
exports.RateBookingController = RateBookingController;