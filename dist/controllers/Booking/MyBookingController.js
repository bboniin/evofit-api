"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MyBookingController = void 0;
var _MyBookingService = require("../../services/Booking/MyBookingService");
class MyBookingController {
  async handle(req, res) {
    const userId = req.userId;
    const myBookingService = new _MyBookingService.MyBookingService();
    const scheduleBooking = await myBookingService.execute({
      userId
    });
    scheduleBooking.schedules.map(item => {
      if (item.professional["photo"]) {
        item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional["photo"];
      }
    });
    scheduleBooking.bookings.map(item => {
      if (item.professional["photo"]) {
        item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional["photo"];
      }
    });
    return res.json(scheduleBooking);
  }
}
exports.MyBookingController = MyBookingController;