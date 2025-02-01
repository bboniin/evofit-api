"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreatePaymentService = void 0;
var OneSignal = _interopRequireWildcard(require("onesignal-node"));
var _prisma = _interopRequireDefault(require("../../prisma"));
var _functions = require("../../config/functions");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const client = new OneSignal.Client("15ee78c4-6dab-4cb5-a606-1bb5b12170e1", "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw");
async function sendNotification(title, text, userId, payment, type) {
  await client.createNotification({
    headings: {
      en: title,
      pt: title
    },
    contents: {
      en: text,
      pt: text
    },
    data: {
      screen: type == "client" ? "PaymentClient" : "Payment",
      params: {
        id: payment.id
      }
    },
    include_external_user_ids: [userId]
  });
  await _prisma.default.notification.create({
    data: {
      title: title,
      message: text,
      type: type == "client" ? "PaymentClient" : "Payment",
      dataId: payment.id,
      userId: userId
    }
  });
}
class CreatePaymentService {
  async execute({
    data
  }) {
    const payment = await _prisma.default.payment.findUnique({
      where: {
        orderId: data["data"]["id"]
      },
      include: {
        client: true,
        professional: true,
        space: true,
        items: true
      }
    });
    const type = payment.items.length == 2 ? "multiple" : payment.items[0].type;
    if (!payment) {
      throw new Error("Pagamento não encontrado");
    }
    if (type == "recurring") {
      await sendNotification("Mensalidade Pendente", "Efetue o pagamento da mensalidade", payment.clientId, payment, "client");
      await sendNotification("Cobrança emitida", `${payment.client.name.toUpperCase()} no valor de ${(0, _functions.getValue)(payment.value)}`, payment.professionalId, payment, "professional");
    } else {
      if (type == "lesson") {
        await sendNotification("Pedido realizado", "Efetue o pagamento para confirmar sua aula", payment.clientId, payment, "client");
        await sendNotification("Novo pedido", `${payment.client.name.toUpperCase()} fez um pedido`, payment.professionalId, payment, "professional");
      } else {
        if (type == "diary") {
          await sendNotification("Pedido realizado", "Efetue o pagamento para confirmar suas diárias", payment.clientId, payment, "client");
          await sendNotification("Novo pedido", `${payment.client.name.toUpperCase()} fez um pedido`, payment.spaceId, payment, "space");
        } else {
          await sendNotification("Pedido realizado", "Efetue o pagamento para confirmar sua aula e diária", payment.clientId, payment, "client");
          await sendNotification("Novo pedido", `${payment.client.name.toUpperCase()} fez um pedido`, payment.spaceId, payment, "space");
          await sendNotification("Novo pedido", `${payment.client.name.toUpperCase()} fez um pedido`, payment.spaceId, payment, "space");
        }
      }
    }
    return data;
  }
}
exports.CreatePaymentService = CreatePaymentService;