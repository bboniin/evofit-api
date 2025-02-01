"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RateBookingService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class RateBookingService {
  async execute({
    bookingId,
    rate,
    comment,
    status
  }) {
    const booking = await _prisma.default.booking.findUnique({
      where: {
        id: bookingId
      },
      include: {
        space: true,
        professional: true,
        client: true,
        ratings: true
      }
    });
    if (!booking) {
      throw new Error("Aula não encontrada");
    }
    if (booking.ratings.length) {
      throw new Error("Aula já foi avaliada");
    }
    await _prisma.default.booking.update({
      where: {
        id: booking.id
      },
      data: {
        status_attendance: status == "completed" ? "completed" : "missed"
      }
    });
    const rating = await _prisma.default.rating.create({
      data: {
        bookingId: booking.id,
        clientId: booking.clientId,
        professionalId: booking.professionalId,
        rate: rate,
        comment: comment
      }
    });
    return rating;
  }
}
exports.RateBookingService = RateBookingService;