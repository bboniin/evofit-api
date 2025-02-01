"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HistoricLessonService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class HistoricLessonService {
  async execute({
    userId
  }) {
    const bookings = await _prisma.default.booking.findMany({
      where: {
        clientId: userId,
        date: {
          lte: new Date()
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
exports.HistoricLessonService = HistoricLessonService;