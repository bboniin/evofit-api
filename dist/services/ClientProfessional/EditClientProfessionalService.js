"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditClientProfessionalService = void 0;
var _dateFns = require("date-fns");
var _functions = require("../../config/functions");
var _prisma = _interopRequireDefault(require("../../prisma"));
var OneSignal = _interopRequireWildcard(require("onesignal-node"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class EditClientProfessionalService {
  async execute({
    name,
    clientId,
    spaceId,
    value,
    email,
    professionalId,
    dayDue,
    billingPeriod,
    schedule,
    consultancy
  }) {
    if (!name || !clientId || !consultancy && !spaceId || !value || !email || !dayDue || !schedule.length) {
      throw new Error("Todos os campos são obrigatórios");
    }
    let data = {
      name: name,
      email: email,
      spaceId: !consultancy ? spaceId : null,
      value: value,
      dayDue: dayDue,
      billingPeriod: billingPeriod || "monthly",
      consultancy: consultancy
    };
    const clientAlreadyExists = await _prisma.default.clientsProfessional.findFirst({
      where: {
        id: clientId
      }
    });
    if (!clientAlreadyExists) {
      throw new Error("Cliente não encontrado");
    }
    if (clientAlreadyExists.email != email && clientAlreadyExists.status == "registration_pending") {
      if (!(0, _functions.validateEmail)(email)) {
        throw new Error("Email inválido");
      }
      const userAlreadyExists = await _prisma.default.user.findFirst({
        where: {
          email: email,
          OR: [{
            role: "PROFESSIONAL"
          }, {
            role: "SPACE"
          }]
        }
      });
      if (userAlreadyExists) {
        throw new Error("Email já está sendo usado por outro tipo de usuário");
      }
      const clientAlreadyExists = await _prisma.default.clientsProfessional.findFirst({
        where: {
          email: email,
          professionalId: professionalId,
          status: {
            not: "cancelled"
          }
        }
      });
      if (clientAlreadyExists) {
        throw new Error("Você já cadastrou um aluno usando esse email");
      }
    }
    if (spaceId) {
      const space = await _prisma.default.space.findUnique({
        where: {
          id: spaceId,
          isDeleted: false
        }
      });
      if (!space) {
        throw new Error("Espaço não encontrado");
      }
    }
    const day = (0, _dateFns.getDate)(new Date());
    if (dayDue != clientAlreadyExists.dayDue && dayDue >= day) {
      data["status"] = "active";
    }
    const clientProfessional = await _prisma.default.clientsProfessional.update({
      where: {
        id: clientId
      },
      data: data,
      include: {
        schedules: true,
        professional: true
      }
    });
    if (clientProfessional.clientId && clientProfessional.status != "registration_pending") {
      const client = new OneSignal.Client("15ee78c4-6dab-4cb5-a606-1bb5b12170e1", "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw");
      if (clientProfessional.value != clientAlreadyExists.value) {
        await client.createNotification({
          headings: {
            en: "Valor da Mensalidade Alterado",
            pt: "Valor da Mensalidade Alterado"
          },
          contents: {
            en: `${clientProfessional.professional.name.toUpperCase()} alterou o valor da mensalidade para ${(0, _functions.getValue)(clientProfessional.value)}`,
            pt: `${clientProfessional.professional.name.toUpperCase()} alterou o valor da mensalidade para ${(0, _functions.getValue)(clientProfessional.value)}`
          },
          data: {
            screen: "ClientSchedule",
            params: {
              id: clientProfessional.id
            }
          },
          include_external_user_ids: [clientProfessional.clientId]
        });
        await _prisma.default.notification.create({
          data: {
            title: "Data de Vencimento Alterada",
            message: `${clientProfessional.professional.name.toUpperCase()} alterou seu vencimento mensal para o dia ${clientProfessional.dayDue}`,
            type: "ClientSchedule",
            dataId: clientProfessional.id,
            userId: clientProfessional.clientId
          }
        });
      }
      if (clientProfessional.dayDue != clientAlreadyExists.dayDue) {
        await client.createNotification({
          headings: {
            en: "Data de Vencimento Alterada",
            pt: "Data de Vencimento Alterada"
          },
          contents: {
            en: `${clientProfessional.professional.name.toUpperCase()} alterou seu vencimento mensal para o dia ${clientProfessional.dayDue}`,
            pt: `${clientProfessional.professional.name.toUpperCase()} alterou seu vencimento mensal para o dia ${clientProfessional.dayDue}`
          },
          data: {
            screen: "ClientSchedule",
            params: {
              id: clientProfessional.id
            }
          },
          include_external_user_ids: [clientProfessional.clientId]
        });
        await _prisma.default.notification.create({
          data: {
            title: "Data de Vencimento Alterada",
            message: `${clientProfessional.professional.name.toUpperCase()} alterou seu vencimento mensal para o dia ${clientProfessional.dayDue}`,
            type: "ClientSchedule",
            dataId: clientProfessional.id,
            userId: clientProfessional.clientId
          }
        });
      }
    }
    const arraysDelete = clientProfessional.schedules.filter(item => schedule.findIndex(data => data.dayOfWeek == item.dayOfWeek) == -1);
    await Promise.all(arraysDelete.map(async item => await _prisma.default.schedule.delete({
      where: {
        id: item.id
      }
    })));
    await Promise.all(schedule.map(async item => {
      const scheduleDay = await _prisma.default.schedule.findUnique({
        where: {
          professionalId_clientProfessionalId_dayOfWeek: {
            professionalId: clientProfessional.professionalId,
            clientProfessionalId: clientProfessional.id,
            dayOfWeek: item.dayOfWeek
          }
        }
      });
      if (scheduleDay) {
        await _prisma.default.schedule.update({
          where: {
            id: scheduleDay.id
          },
          data: {
            startTime: item.startTime,
            endTime: item.endTime
          }
        });
      } else {
        await _prisma.default.schedule.create({
          data: {
            professionalId: clientProfessional.professionalId,
            clientProfessionalId: clientProfessional.id,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            recurring: true,
            isBlock: false,
            date: new Date()
          }
        });
      }
    }));
    if (consultancy) {
      await _prisma.default.schedule.deleteMany({
        where: {
          professionalId: clientProfessional.professionalId,
          clientProfessionalId: clientProfessional.id
        }
      });
    }
    return clientProfessional;
  }
}
exports.EditClientProfessionalService = EditClientProfessionalService;