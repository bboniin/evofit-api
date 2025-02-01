"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpirePaymentService = void 0;
var OneSignal = _interopRequireWildcard(require("onesignal-node"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class ExpirePaymentService {
  async execute() {
    const payments = await _prisma.default.payment.findMany({
      where: {
        expireAt: {
          lte: new Date()
        },
        status: "awaiting_payment"
      },
      include: {
        items: true
      }
    });
    await _prisma.default.payment.updateMany({
      where: {
        AND: {
          expireAt: {
            lte: new Date()
          },
          status: "awaiting_payment"
        }
      },
      data: {
        status: "cancelled"
      }
    });
    const client = new OneSignal.Client("15ee78c4-6dab-4cb5-a606-1bb5b12170e1", "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw");
    payments.map(async payment => {
      const type = payment.items.length == 2 ? "multiple" : payment.items[0].type;
      if (type == "recurring") {
        await client.createNotification({
          headings: {
            en: "Mensalidade cancelada",
            pt: "Mensalidade cancelada"
          },
          contents: {
            en: "Pagamento cancelado, entre em contato com o profissional para ficar em dia",
            pt: "Pagamento cancelado, entre em contato com o profissional para ficar em dia"
          },
          data: {
            screen: "PaymentClient",
            params: {
              id: payment.id
            }
          },
          include_external_user_ids: [payment.clientId]
        });
        await _prisma.default.notification.create({
          data: {
            title: "Mensalidade cancelada",
            message: "Pagamento cancelado, entre em contato com o profissional para ficar em dia",
            type: "PaymentClient",
            dataId: payment.id,
            userId: payment.clientId
          }
        });
        if (payment.description == "Adesão Consultoria") {
          await _prisma.default.clientsProfessional.update({
            where: {
              professionalId_clientId: {
                professionalId: payment.professionalId,
                clientId: payment.clientId
              },
              consultancy: true
            },
            data: {
              status: "cancelled"
            }
          });
        }
      } else {
        if (type == "diary") {
          await client.createNotification({
            headings: {
              en: "Pedido cancelado",
              pt: "Pedido cancelado"
            },
            contents: {
              en: "Por falta de pagamento o seu pedido foi cancelado",
              pt: "Por falta de pagamento o seu pedido foi cancelado"
            },
            data: {
              screen: "PaymentClient",
              params: {
                id: payment.id
              }
            },
            include_external_user_ids: [payment.clientId]
          });
          await _prisma.default.notification.create({
            data: {
              title: "Pedido cancelado",
              message: "Por falta de pagamento o seu pedido foi cancelado",
              type: "PaymentClient",
              dataId: payment.id,
              userId: payment.clientId
            }
          });
        } else {
          await client.createNotification({
            headings: {
              en: "Pedido cancelado",
              pt: "Pedido cancelado"
            },
            contents: {
              en: "Por falta de pagamento o seu pedido foi cancelado",
              pt: "Por falta de pagamento o seu pedido foi cancelado"
            },
            data: {
              screen: "PaymentClient",
              params: {
                id: payment.id
              }
            },
            include_external_user_ids: [payment.clientId]
          });
          await _prisma.default.booking.update({
            where: {
              paymentId: payment.id
            },
            data: {
              status: "cancelled"
            }
          });
          await _prisma.default.notification.create({
            data: {
              title: "Pedido cancelado",
              message: "Por falta de pagamento o seu pedido foi cancelado",
              type: "PaymentClient",
              dataId: payment.id,
              userId: payment.clientId
            }
          });
        }
      }
    });
  }
}
exports.ExpirePaymentService = ExpirePaymentService;