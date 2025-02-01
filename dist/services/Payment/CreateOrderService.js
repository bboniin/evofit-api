"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateOrderService = void 0;
var _dateFns = require("date-fns");
var _api = _interopRequireDefault(require("../../config/api"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateOrderService {
  async execute({
    spaceId,
    clientId,
    date,
    startTime,
    endTime,
    professionalId,
    amount,
    buyDiarie
  }) {
    const client = await _prisma.default.client.findUnique({
      where: {
        userId: clientId
      },
      include: {
        user: true
      }
    });
    if (!client) {
      throw new Error("Cliente não encontrado");
    }
    const space = await _prisma.default.space.findUnique({
      where: {
        id: spaceId,
        isDeleted: false
      }
    });
    if (!space) {
      throw new Error("Espaço não encontrado");
    }
    let professional = null;
    if (professionalId) {
      professional = await _prisma.default.professional.findUnique({
        where: {
          userId: professionalId,
          isDeleted: false
        }
      });
      if (!professional) {
        throw new Error("Profissional não encontrado");
      }
      if (!startTime || !date || !endTime) {
        throw new Error("Data e horários de inicio e fim são obrigatórios");
      }
      if ((0, _dateFns.isSameDay)(date, new Date())) {
        const parsedTime = (0, _dateFns.format)((0, _dateFns.addHours)(new Date(), 2), "HH:mm");
        if ((0, _dateFns.format)(new Date(), "HH:mm") > "22:00" || parsedTime > startTime) {
          throw new Error("Só é permitidos reservar aulas com 2 horas de antecedência");
        }
      }
      const startDateTime = new Date(`${(0, _dateFns.format)(date, "yyyy-MM-dd")}T${startTime}`);
      const endDateTime = new Date(`${(0, _dateFns.format)(date, "yyyy-MM-dd")}T${endTime}`);
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
    }
    let order = {};
    const type = buyDiarie && professionalId ? "multiple" : professionalId ? "lesson" : "diary";
    const valueAll = (type == "multiple" ? space.valueDiarie + professional.valueLesson : type == "diary" ? space.valueDiarie * amount : professional.valueLesson) * 100;
    const valuePaid = valueAll * 1.02;
    const valueProfessional = professional.valueLesson * 100;
    const valueSpace = (type == "multiple" ? space.valueDiarie : space.valueDiarie * amount) * 100;
    const splits = [];
    if (type == "multiple" || type == "diary") {
      splits.push({
        amount: valueSpace,
        recipient_id: space.recipientId,
        type: "flat",
        options: {
          charge_processing_fee: false,
          charge_remainder_fee: false,
          liable: false
        }
      });
    }
    if (type == "multiple" || type == "lesson") {
      splits.push({
        amount: valueProfessional,
        recipient_id: professional.recipientId,
        type: "flat",
        options: {
          charge_processing_fee: false,
          charge_remainder_fee: false,
          liable: false
        }
      });
    }
    await _api.default.post("/orders", {
      closed: true,
      items: [{
        amount: valuePaid,
        description: type == "multiple" ? "Diária e Aula" : type == "diary" ? "Diária Academia" : "Aula Personal",
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
        split: [...splits, {
          amount: valuePaid - valueAll,
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
          description: type == "multiple" ? "Diária e Aula" : type == "diary" ? "Diária Academia" : "Aula Personal",
          spaceId: type != "lesson" ? spaceId : null,
          professionalId: type != "diary" ? professionalId : null,
          type: type,
          clientId: client.id,
          rate: (valuePaid - valueAll) / 100,
          value: valueAll / 100,
          orderId: response.data.id,
          expireAt: (0, _dateFns.addMinutes)(new Date(), 30),
          items: {
            create: type == "diary" ? [{
              type: "diary",
              amount: amount,
              value: space.valueDiarie
            }] : type == "lesson" ? [{
              type: "lesson",
              amount: 1,
              value: professional.valueLesson
            }] : [{
              type: "lesson",
              amount: 1,
              value: professional.valueLesson
            }, {
              type: "diary",
              amount: 1,
              value: space.valueDiarie
            }]
          }
        }
      });
      if (type != "diary") {
        await _prisma.default.booking.create({
          data: {
            professionalId,
            clientId: client.id,
            startTime: startTime,
            paymentId: order["id"],
            date: date,
            endTime: endTime,
            spaceId: spaceId,
            status: "pending"
          }
        });
      }
    }).catch(e => {
      console.log(e.response.data);
      throw new Error("Ocorreu um erro ao criar cobrança");
    });
    return order;
  }
}
exports.CreateOrderService = CreateOrderService;