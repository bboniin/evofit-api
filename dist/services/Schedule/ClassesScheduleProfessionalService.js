"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClassesScheduleProfessionalService = void 0;
var _dateFns = require("date-fns");
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ClassesScheduleProfessionalService {
  async execute({
    date,
    professionalId
  }) {
    const dayOfWeek = date.getDay();
    const bookings = await _prisma.default.booking.findMany({
      where: {
        professionalId,
        status: {
          not: "cancelled"
        },
        AND: [{
          date: {
            gte: (0, _dateFns.startOfDay)(date)
          }
        }, {
          date: {
            lte: (0, _dateFns.endOfDay)(date)
          }
        }]
      },
      include: {
        client: true,
        space: true
      }
    });
    const schedules = await _prisma.default.schedule.findMany({
      where: {
        professionalId,
        OR: [{
          recurring: true,
          dayOfWeek
        }, {
          date: date
        }],
        createdAt: {
          lte: (0, _dateFns.startOfDay)(date)
        },
        AND: [{
          OR: [{
            clientProfessional: null
          }, {
            clientProfessional: {
              status: {
                not: "cancelled"
              }
            }
          }]
        }]
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
    schedules.map(item => {
      if (item["clientProfessional"]) {
        item["client"] = item["clientProfessional"]["client"] || {};
      }
    });
    const classes = [...bookings, ...schedules].sort((a, b) => a.startTime.localeCompare(b.startTime));
    return classes;
  }
}
exports.ClassesScheduleProfessionalService = ClassesScheduleProfessionalService;