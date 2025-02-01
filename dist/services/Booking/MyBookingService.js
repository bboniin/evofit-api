"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MyBookingService = void 0;
var _dateFns = require("date-fns");
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class MyBookingService {
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
    const schedules = await _prisma.default.clientsProfessional.findMany({
      where: {
        clientId: client.id
      },
      orderBy: {
        status: "asc"
      },
      include: {
        professional: true,
        schedules: true,
        space: true
      }
    });
    const bookings = await _prisma.default.booking.findMany({
      where: {
        clientId: client.id,
        date: {
          gte: (0, _dateFns.startOfDay)(new Date())
        },
        status: {
          not: "cancelled"
        }
      },
      include: {
        professional: true,
        space: true
      }
    });
    return {
      schedules,
      bookings
    };
  }
}
exports.MyBookingService = MyBookingService;