"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuyConsultancyService = void 0;
var _dateFns = require("date-fns");
var _api = _interopRequireDefault(require("../../config/api"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class BuyConsultancyService {
  async execute({
    professionalId,
    userId
  }) {
    if (!professionalId || !userId) {
      throw new Error("Todos os campos são obrigatórios");
    }
    const user = await _prisma.default.user.findUnique({
      where: {
        id: userId
      },
      include: {
        client: true
      }
    });
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    const clientProfessionalAlreadyExists = await _prisma.default.clientsProfessional.findFirst({
      where: {
        OR: [{
          email: user.email
        }, {
          clientId: user.id
        }],
        professionalId: professionalId,
        status: {
          not: "cancelled"
        }
      }
    });
    if (clientProfessionalAlreadyExists) {
      throw new Error("Você já é aluno desse personal");
    }
    const professional = await _prisma.default.professional.findFirst({
      where: {
        id: professionalId,
        isDeleted: false
      }
    });
    if (!professional) {
      throw new Error("Profissional não encontrado");
    }
    const valueClientAll = professional.valueConsultancy * 100;
    const valuePaid = valueClientAll * 1.012;
    let order = {};
    await _api.default.post("/orders", {
      closed: true,
      items: [{
        amount: valuePaid,
        description: `Adesão Consultoria`,
        quantity: 1,
        code: 1
      }],
      customer: {
        name: user.client.name,
        type: "individual",
        document: user.client.cpf,
        email: user.email,
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
          expires_in: (0, _dateFns.differenceInSeconds)((0, _dateFns.addDays)(new Date(), 5), new Date()),
          additional_information: [{
            name: "information",
            value: "number"
          }]
        },
        split: [{
          amount: valueClientAll,
          recipient_id: professional.recipientId,
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
      order = await _prisma.default.payment.create({
        data: {
          description: `Adesão Consultoria`,
          professionalId: professionalId,
          clientId: user.client.id,
          rate: (valuePaid - valueClientAll) / 100,
          recurring: true,
          type: "recurring",
          value: valueClientAll / 100,
          orderId: response.data.id,
          expireAt: (0, _dateFns.addDays)(new Date(), 5),
          items: {
            create: [{
              type: "recurring",
              value: professional.valueConsultancy,
              amount: 1
            }]
          }
        }
      });
      const day = (0, _dateFns.getDate)(new Date()) + 5;
      await _prisma.default.clientsProfessional.create({
        data: {
          name: user.client.name,
          email: user.email,
          phoneNumber: user.client.phoneNumber,
          value: professional.valueConsultancy,
          professionalId: professionalId,
          clientId: user.id,
          billingPeriod: "monthly",
          consultancy: true,
          dayDue: day > 28 ? day - 28 : day,
          status: "awaiting_payment"
        }
      });
    }).catch(e => {
      throw new Error("Ocorreu um erro ao criar cobrança");
    });
    return order;
  }
}
exports.BuyConsultancyService = BuyConsultancyService;