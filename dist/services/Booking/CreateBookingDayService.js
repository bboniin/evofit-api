"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateBookingDayService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateBookingDayService {
  async execute() {
    const dayOfWeek = new Date().getDay();
    const schedules = await _prisma.default.schedule.findMany({
      where: {
        recurring: true,
        dayOfWeek,
        clientProfessional: {
          OR: [{
            status: "active"
          }, {
            status: "overdue"
          }]
        }
      },
      include: {
        clientProfessional: {
          include: {
            client: true,
            space: true
          }
        }
      }
    });
    Promise.all(schedules.map(async item => {
      await _prisma.default.booking.create({
        data: {
          professionalId: item.professionalId,
          clientId: item.clientProfessional.client.id,
          startTime: item.startTime,
          date: new Date(),
          endTime: item.endTime,
          spaceId: item.clientProfessional.spaceId,
          status: "confirmed"
        }
      });
    }));
  }
}
exports.CreateBookingDayService = CreateBookingDayService;