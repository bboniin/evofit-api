"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChargePaymentService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _dateFns = require("date-fns");
var _api = _interopRequireDefault(require("../../config/api"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ChargePaymentService {
  async execute() {
    const day = (0, _dateFns.getDate)(new Date());
    const clients = await _prisma.default.clientsProfessional.findMany({
      where: {
        dayDue: day + 1,
        status: "active"
      },
      include: {
        professional: true,
        client: {
          include: {
            user: true
          }
        }
      }
    });
    await _prisma.default.clientsProfessional.updateMany({
      where: {
        dayDue: day - 1,
        status: "awaiting_payment"
      },
      data: {
        status: "overdue"
      }
    });
    await _prisma.default.clientsProfessional.updateMany({
      where: {
        dayDue: day + 1,
        status: "active"
      },
      data: {
        status: "awaiting_payment"
      }
    });
    await Promise.all(clients.map(async client => {
      const valueClientAll = client.value * 100;
      const valuePaid = valueClientAll * 1.012;
      await _api.default.post("/orders", {
        closed: true,
        items: [{
          amount: valuePaid,
          description: `Mensalidade ${client.consultancy ? "Consultoria" : "Personal"}`,
          quantity: 1,
          code: 1
        }],
        customer: {
          name: client.name,
          type: "individual",
          document: client.client.cpf,
          email: client.client.user.email,
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
            expires_in: 259200,
            additional_information: [{
              name: "information",
              value: "number"
            }]
          },
          split: [{
            amount: valueClientAll,
            recipient_id: client.professional.recipientId,
            type: "flat",
            options: {
              charge_processing_fee: false,
              charge_remainder_fee: false,
              liable: false
            }
          }, {
            amount: valuePaid - valueClientAll,
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
        await _prisma.default.payment.create({
          data: {
            description: "Mensalidade",
            professionalId: client.professionalId,
            clientId: client.id,
            type: "recurring",
            value: valueClientAll / 100,
            rate: (valuePaid - valueClientAll) / 100,
            orderId: response.data.id,
            expireAt: (0, _dateFns.addDays)(new Date(), 3),
            items: {
              create: [{
                type: "recurring",
                amount: 1,
                value: client.value
              }]
            }
          }
        });
      }).catch(e => {
        throw new Error("Ocorreu um erro ao criar cobrança");
      });
    }));
  }
}
exports.ChargePaymentService = ChargePaymentService;