"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationPaymentService = void 0;
var OneSignal = _interopRequireWildcard(require("onesignal-node"));
var _prisma = _interopRequireDefault(require("../../prisma"));
var _dateFns = require("date-fns");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class NotificationPaymentService {
  async execute() {
    const day = (0, _dateFns.getDate)(new Date());
    const clientsDayAfter = await _prisma.default.clientsProfessional.findMany({
      where: {
        dayDue: day - 1,
        status: "awaiting_payment"
      }
    });
    const clientsToday = await _prisma.default.clientsProfessional.findMany({
      where: {
        dayDue: day,
        status: "awaiting_payment"
      }
    });
    const clientOneSignal = new OneSignal.Client("15ee78c4-6dab-4cb5-a606-1bb5b12170e1", "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw");
    await Promise.all(clientsDayAfter.map(async client => {
      const payment = await _prisma.default.payment.findFirst({
        where: {
          clientProfessionalId: client.id
        },
        orderBy: {
          date: "desc"
        }
      });
      await clientOneSignal.createNotification({
        headings: {
          en: "Mensalidade pendente",
          pt: "Mensalidade pendente"
        },
        contents: {
          en: "Sua mensalidade vence amanhã",
          pt: "Sua mensalidade vence amanhã"
        },
        data: {
          screen: "PaymentClient",
          params: {
            id: payment.id
          }
        },
        include_external_user_ids: [client.clientId]
      });
      await _prisma.default.notification.create({
        data: {
          title: "Mensalidade pendente",
          message: "Sua mensalidade vence amanhã",
          type: "PaymentClient",
          dataId: payment.id,
          userId: client.clientId
        }
      });
    }));
    await Promise.all(clientsToday.map(async client => {
      const payment = await _prisma.default.payment.findFirst({
        where: {
          clientProfessionalId: client.id
        },
        orderBy: {
          date: "desc"
        }
      });
      await clientOneSignal.createNotification({
        headings: {
          en: "Mensalidade vence hoje",
          pt: "Mensalidade vence hoje"
        },
        contents: {
          en: "Efetue o pagamento para evitar cancelamento",
          pt: "Efetue o pagamento para evitar cancelamento"
        },
        data: {
          screen: "PaymentClient",
          params: {
            id: payment.id
          }
        },
        include_external_user_ids: [client.clientId]
      });
      await _prisma.default.notification.create({
        data: {
          title: "Mensalidade vence hoje",
          message: "Efetue o pagamento para evitar cancelamento",
          type: "PaymentClient",
          dataId: payment.id,
          userId: client.clientId
        }
      });
    }));
    const clientsOverdue = await _prisma.default.clientsProfessional.findMany({
      where: {
        dayDue: day - 1,
        status: "overdue"
      }
    });
    await Promise.all(clientsOverdue.map(async client => {
      const payment = await _prisma.default.payment.findFirst({
        where: {
          clientProfessionalId: client.id
        },
        orderBy: {
          date: "desc"
        }
      });
      await clientOneSignal.createNotification({
        headings: {
          en: "Mensalidade está atrasada",
          pt: "Mensalidade está atrasada"
        },
        contents: {
          en: "Efetue o pagamento para evitar cancelamento",
          pt: "Efetue o pagamento para evitar cancelamento"
        },
        data: {
          screen: "PaymentClient",
          params: {
            id: payment.id
          }
        },
        include_external_user_ids: [client.clientId]
      });
      await _prisma.default.notification.create({
        data: {
          title: "Mensalidade está atrasada",
          message: "Efetue o pagamento para evitar cancelamento",
          type: "PaymentClient",
          dataId: payment.id,
          userId: client.clientId
        }
      });
    }));
  }
}
exports.NotificationPaymentService = NotificationPaymentService;