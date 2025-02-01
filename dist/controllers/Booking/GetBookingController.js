"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetBookingController = void 0;
var _GetBookingService = require("../../services/Booking/GetBookingService");
class GetBookingController {
  async handle(req, res) {
    const {
      bookingId
    } = req.params;
    const getBookingService = new _GetBookingService.GetBookingService();
    const bookig = await getBookingService.execute({
      bookingId
    });
    if (bookig.professional["photo"]) {
      bookig.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + bookig.professional["photo"];
    }
    if (bookig.client["photo"]) {
      bookig.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + bookig.client["photo"];
    }
    if (bookig.space["photo"]) {
      bookig.space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + bookig.space["photo"];
    }
    return res.json(bookig);
  }
}
exports.GetBookingController = GetBookingController;