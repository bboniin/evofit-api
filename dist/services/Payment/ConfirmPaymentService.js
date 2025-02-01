"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfirmPaymentService = void 0;
var OneSignal = _interopRequireWildcard(require("onesignal-node"));
var _prisma = _interopRequireDefault(require("../../prisma"));
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
class ConfirmPaymentService {
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
    if (!payment) {
      throw new Error("Pagamento não encontrado");
    }
    const type = payment.items.length == 2 ? "multiple" : payment.items[0].type;
    if (type == "recurring") {
      await _prisma.default.clientsProfessional.update({
        where: {
          professionalId_clientId: {
            professionalId: payment.professionalId,
            clientId: payment.clientId
          }
        },
        data: {
          status: "active",
          visible: true
        }
      });
      await sendNotification("Pagamento confirmado", `Pagamento realizado com sucesso`, payment.clientId, payment, "client");
      await sendNotification("Pagamento confirmado", `${payment.client.name.toUpperCase()} pagou a mensalidade`, payment.professionalId, payment, "professional");
    } else {
      if (type == "lesson") {
        await sendNotification("Pedido confirmado", "Sua aula está confirmada", payment.clientId, payment, "client");
        await sendNotification("Pagamento confirmado", `${payment.client.name.toUpperCase()} confirmou sua reserva`, payment.professionalId, payment, "professional");
        await _prisma.default.booking.updateMany({
          where: {
            paymentId: payment.id
          },
          data: {
            status: "confirmed"
          }
        });
      } else {
        if (type == "diary") {
          await sendNotification("Pedido confirmado", "Suas diárias estão confirmadas", payment.clientId, payment, "client");
          await sendNotification("Pagamento confirmado", `${payment.client.name.toUpperCase()} confirmou suas diárias`, payment.spaceId, payment, "space");
          for (let i = 0; i < payment.items[0].amount; i++) {
            await _prisma.default.diary.create({
              data: {
                spaceId: payment.space.id,
                clientId: payment.client.id,
                itemId: payment.items[0].id,
                used: false
              }
            });
          }
        } else {
          await sendNotification("Pedido confirmado", "Sua aula pessoal e diária estão confirmadas", payment.clientId, payment, "client");
          await sendNotification("Pagamento confirmado", `${payment.client.name.toUpperCase()} confirmou sua diária`, payment.spaceId, payment, "space");
          await sendNotification("Pagamento confirmado", `${payment.client.name.toUpperCase()} confirmou sua reserva`, payment.professionalId, payment, "professional");
          await _prisma.default.booking.updateMany({
            where: {
              paymentId: payment.id
            },
            data: {
              status: "confirmed"
            }
          });
          await _prisma.default.diary.create({
            data: {
              spaceId: payment.space.id,
              clientId: payment.client.id,
              itemId: payment.items.find(data => data.type == "diary").id,
              used: false
            }
          });
        }
      }
    }
    await _prisma.default.payment.update({
      where: {
        id: payment.id
      },
      data: {
        status: "paid"
      }
    });
    return data;
  }
}
exports.ConfirmPaymentService = ConfirmPaymentService;