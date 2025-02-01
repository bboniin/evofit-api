"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FrequencyBookingService = void 0;
var _dateFns = require("date-fns");
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class FrequencyBookingService {
  async execute({
    userId
  }) {
    const client = await _prisma.default.client.findUnique({
      where: {
        userId: userId
      }
    });
    if (!client) {
      throw new Error("Cliente não encontrado");
    }
    const bookings = await _prisma.default.booking.findMany({
      where: {
        clientId: client.id,
        date: {
          lte: (0, _dateFns.endOfDay)((0, _dateFns.addDays)(new Date(), -1))
        }
      },
      include: {
        professional: true,
        space: true
      }
    });
    return bookings;
  }
}
exports.FrequencyBookingService = FrequencyBookingService;