"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuyBookingService = void 0;
var _dateFns = require("date-fns");
var _prisma = _interopRequireDefault(require("../../prisma"));
var _api = _interopRequireDefault(require("../../config/api"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class BuyBookingService {
  async execute({
    professionalId,
    clientId,
    date,
    startTime,
    endTime
  }) {
    const startDateTime = new Date(`${(0, _dateFns.format)(date, "yyyy-MM-dd")}T${startTime}`);
    const endDateTime = new Date(`${(0, _dateFns.format)(date, "yyyy-MM-dd")}T${endTime}`);
    const client = await _prisma.default.client.findUnique({
      where: {
        userId: clientId
      },
      include: {
        user: true
      }
    });
    const professional = await _prisma.default.professional.findUnique({
      where: {
        userId: professionalId,
        isDeleted: false
      }
    });
    if (!client) {
      throw new Error("Cliente não encontrado");
    }
    if (!professional) {
      throw new Error("Profissional não encontrado");
    }
    const dayOfWeek = new Date(date).getDay();
    const workSchedule = await _prisma.default.workSchedule.findUnique({
      where: {
        professionalId_dayOfWeek: {
          professionalId,
          dayOfWeek
        }
      }
    });
    if (!workSchedule) {
      throw new Error("Horário de trabalho não encontrado para este dia");
    }
    const workStartTime = new Date(`${(0, _dateFns.format)(date, "yyyy-MM-dd")}T${workSchedule.startTime}`);
    const workEndTime = new Date(`${(0, _dateFns.format)(date, "yyyy-MM-dd")}T${workSchedule.endTime}`);
    if ((0, _dateFns.isBefore)(startDateTime, workStartTime) || (0, _dateFns.isAfter)(endDateTime, workEndTime)) {
      throw new Error("O horário selecionado está fora do horário de trabalho");
    }
    const schedules = await _prisma.default.schedule.findMany({
      where: {
        professionalId,
        OR: [{
          recurring: true,
          dayOfWeek
        }, {
          date: date
        }]
      }
    });
    const bookings = await _prisma.default.booking.findMany({
      where: {
        professionalId,
        AND: [{
          date: {
            gte: (0, _dateFns.startOfDay)(date)
          }
        }, {
          date: {
            lte: (0, _dateFns.endOfDay)(date)
          }
        }]
      }
    });
    const isBlocked = schedules.some(schedule => ((0, _dateFns.isAfter)(startDateTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", date)) || (0, _dateFns.isEqual)(startDateTime, (0, _dateFns.parse)(schedule.startTime, "HH:mm", date))) && ((0, _dateFns.isBefore)(endDateTime, (0, _dateFns.parse)(schedule.endTime, "HH:mm", date)) || (0, _dateFns.isEqual)(endDateTime, (0, _dateFns.parse)(schedule.endTime, "HH:mm", date))) && schedule.isBlock);
    if (isBlocked) {
      throw new Error("O horário não está disponivel");
    }
    const isBooked = bookings.some(booking => ((0, _dateFns.isAfter)(startDateTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date)) || (0, _dateFns.isEqual)(startDateTime, (0, _dateFns.parse)(booking.startTime, "HH:mm", date))) && ((0, _dateFns.isBefore)(endDateTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date)) || (0, _dateFns.isEqual)(endDateTime, (0, _dateFns.parse)(booking.endTime, "HH:mm", date))));
    if (isBooked) {
      throw new Error("O horário não está disponivel");
    }
    let order = {};
    const valueLessonAll = professional.valueLesson * 100;
    const valuePaid = valueLessonAll * 1.02;
    await _api.default.post("/orders", {
      closed: true,
      items: [{
        amount: valuePaid,
        description: "Diária Academia",
        quantity: 1,
        code: 1
      }],
      customer: {
        name: client.name,
        type: "individual",
        document: client.cpf,
        email: client.user.email,
        phones: {
          mobile_phone: {
            country_code: "55",
            number: "000000000",
            area_code: "11"
          }
        }
      },
      payments: [{
        payment_method: "pix",
        pix: {
          expires_in: 1800,
          additional_information: [{
            name: "information",
            value: "number"
          }]
        },
        split: [{
          amount: valueLessonAll,
          recipient_id: professional.recipientId,
          type: "flat",
          options: {
            charge_processing_fee: false,
            charge_remainder_fee: false,
            liable: false
          }
        }, {
          amount: valuePaid - valueLessonAll,
          recipient_id: "re_cm6b5djbg7lho0l9tx4wau5zy",
          type: "flat",
          options: {
            charge_processing_fee: true,
            charge_remainder_fee: true,
            liable: true
          }
        }]
      }]
    }).then(async response => {
      order = await _prisma.default.payment.create({
        data: {
          description: "Aula Personal",
          professionalId,
          clientId: client.id,
          type: "diary",
          rate: (valuePaid - valueLessonAll) / 100,
          value: valueLessonAll / 100,
          orderId: response.data.id,
          expireAt: (0, _dateFns.addMinutes)(new Date(), 30),
          items: {
            create: [{
              type: "lesson",
              value: professional.valueLesson,
              amount: 1
            }]
          }
        }
      });
      await _prisma.default.booking.create({
        data: {
          professionalId,
          clientId: client.id,
          startTime: startTime,
          paymentId: order["id"],
          spaceId: client.id,
          date: date,
          endTime: endTime,
          status: "pending"
        }
      });
    }).catch(e => {
      console.log(e.response.data);
      throw new Error("Ocorreu um erro ao criar cobrança");
    });
    return order;
  }
}
exports.BuyBookingService = BuyBookingService;