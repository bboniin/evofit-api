"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateClientService = void 0;
var _bcryptjs = require("bcryptjs");
var _prisma = _interopRequireDefault(require("../../prisma"));
var _jsonwebtoken = require("jsonwebtoken");
var _auth = _interopRequireDefault(require("../../utils/auth"));
var _api = _interopRequireDefault(require("../../config/api"));
var _dateFns = require("date-fns");
var _functions = require("../../config/functions");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateClientService {
  async execute({
    name,
    password,
    birthday,
    phoneNumber,
    cpf,
    objective,
    experienceLevel,
    email
  }) {
    if (!name || !phoneNumber || !password || !cpf || !objective || !experienceLevel || !email || !birthday) {
      throw new Error("Preencha todos os campos obrigatórios");
    }
    const userAlreadyExists = await _prisma.default.user.findFirst({
      where: {
        email: email
      }
    });
    if (userAlreadyExists) {
      throw new Error("Email já cadastrado");
    }
    const cpfString = cpf.replace(/\D/g, "");
    if (!(0, _functions.validateCpf)(cpfString)) {
      throw new Error("CPF inválido");
    }
    const userAlreadyExistsCPF = await _prisma.default.user.findFirst({
      where: {
        OR: [{
          space: {
            cpfOrCnpj: cpfString
          }
        }, {
          client: {
            cpf: cpfString
          }
        }, {
          professional: {
            cpfOrCnpj: cpfString
          }
        }]
      }
    });
    if (userAlreadyExistsCPF) {
      throw new Error("CPF já está em uso");
    }
    if (!(0, _functions.validateEmail)(email)) {
      throw new Error("Email inválido");
    }
    if (!(0, _functions.validatePhone)(phoneNumber)) {
      throw new Error("Telefone inválido");
    }
    const passwordHash = await (0, _bcryptjs.hash)(password, 8);
    let data = {
      name: name,
      birthday: new Date(birthday),
      phoneNumber: phoneNumber,
      cpf: cpfString,
      objective: objective,
      experienceLevel: experienceLevel,
      photo: ""
    };
    const user = await _prisma.default.user.create({
      data: {
        email: email,
        password: passwordHash,
        role: "CLIENT"
      }
    });
    const client = await _prisma.default.client.create({
      data: {
        id: user.id,
        userId: user.id,
        ...data
      }
    });
    const clients = await _prisma.default.clientsProfessional.findMany({
      where: {
        email: email,
        clientId: null
      }
    });
    const day = (0, _dateFns.getDate)(new Date());
    await Promise.all(clients.map(async item => {
      const clientUp = await _prisma.default.clientsProfessional.update({
        where: {
          id: item.id
        },
        data: {
          clientId: user.id,
          status: day == item.dayDue || day + 1 == item.dayDue ? "awaiting_payment" : item.dayDue > day ? "overdue" : "active"
        },
        include: {
          client: {
            include: {
              user: true
            }
          },
          professional: true
        }
      });
      if (item.dayDue >= day + 1) {
        const valueClientAll = clientUp.value * 100;
        const valuePaid = valueClientAll * 1.012;
        await _api.default.post("/orders", {
          closed: true,
          items: [{
            amount: valuePaid,
            description: `Mensalidade ${item.consultancy ? "Consultoria" : "Personal"}`,
            quantity: 1,
            code: 1
          }],
          customer: {
            name: clientUp.client.name,
            type: "individual",
            document: clientUp.client.cpf,
            email: clientUp.client.user.email,
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
              recipient_id: clientUp.professional.recipientId,
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
              description: `Mensalidade ${clientUp.consultancy ? "Consultoria" : "Personal"}`,
              professionalId: clientUp.professionalId,
              clientId: client.id,
              recurring: true,
              type: "recurring",
              value: valueClientAll / 100,
              rate: (valuePaid - valueClientAll) / 100,
              orderId: response.data.id,
              expireAt: (0, _dateFns.addDays)(new Date(), 3),
              items: {
                create: [{
                  amount: 1,
                  type: "recurring",
                  value: valueClientAll / 100
                }]
              }
            }
          });
        }).catch(e => {
          console.log(e.response.data);
          throw new Error("Ocorreu um erro ao criar cobrança");
        });
      }
      return true;
    }));
    const token = (0, _jsonwebtoken.sign)({
      email: user.email,
      role: user.role
    }, _auth.default.jwt.secret, {
      subject: user.id,
      expiresIn: "365d"
    });
    return {
      role: user.role,
      email: user.email,
      token: token,
      ...client
    };
  }
}
exports.CreateClientService = CreateClientService;