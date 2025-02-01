"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetBookingService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetBookingService {
  async execute({
    bookingId
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
    return booking;
  }
}
exports.GetBookingService = GetBookingService;