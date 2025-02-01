"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FrequencyBookingController = void 0;
var _FrequencyBookingService = require("../../services/Booking/FrequencyBookingService");
class FrequencyBookingController {
  async handle(req, res) {
    const userId = req.userId;
    const frequencyBookingService = new _FrequencyBookingService.FrequencyBookingService();
    const frequency = await frequencyBookingService.execute({
      userId
    });
    frequency.map(item => {
      if (item.professional["photo"]) {
        item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional["photo"];
      }
    });
    return res.json(frequency);
  }
}
exports.FrequencyBookingController = FrequencyBookingController;