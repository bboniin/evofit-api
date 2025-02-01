"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListPaymentsService = void 0;
var _dateFns = require("date-fns");
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ListPaymentsService {
  async execute({
    userId,
    month,
    all
  }) {
    const date = (0, _dateFns.addMonths)(new Date(), month);
    const user = await _prisma.default.user.findUnique({
      where: {
        id: userId
      }
    });
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    const payments = await _prisma.default.payment.findMany({
      where: all ? {
        OR: [{
          spaceId: userId
        }, {
          professionalId: userId
        }],
        status: {
          not: "cancelled"
        }
      } : {
        OR: [{
          spaceId: userId
        }, {
          professionalId: userId
        }],
        status: "paid",
        date: {
          gte: (0, _dateFns.startOfMonth)(date),
          lte: (0, _dateFns.endOfMonth)(date)
        }
      },
      orderBy: {
        date: "desc"
      },
      include: {
        client: true,
        items: true
      }
    });
    payments.map(item => {
      if (item.type == "multiple") {
        if (user.role == "PROFESSIONAL") {
          item.value = item.items.find(data => data.type == "lesson").value || 0;
        } else {
          item.value = item.items.find(data => data.type == "diary").value || 0;
        }
      }
    });
    return payments;
  }
}
exports.ListPaymentsService = ListPaymentsService;