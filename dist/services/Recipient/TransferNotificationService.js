"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransferNotificationService = void 0;
var OneSignal = _interopRequireWildcard(require("onesignal-node"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class TransferNotificationService {
  async execute({
    data
  }) {
    const space = await _prisma.default.space.findFirst({
      where: {
        recipientId: data["data"]["id"],
        isDeleted: false
      }
    });
    const professional = await _prisma.default.professional.findFirst({
      where: {
        recipientId: data["data"]["id"],
        isDeleted: false
      }
    });
    if (!professional && !space) {
      throw new Error("Usuário não encontrado");
    }
    const user = professional || space;
    const userType = professional ? "professional" : "space";
    const client = new OneSignal.Client("15ee78c4-6dab-4cb5-a606-1bb5b12170e1", "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw");
    if (data["data"]["status"] == "active") {
      await client.createNotification({
        headings: {
          en: "Conta Bancaria Ativa",
          pt: "Conta Bancaria Ativa"
        },
        contents: {
          en: "Seus dados foram confirmados e agora você pode sacar",
          pt: "Seus dados foram confirmados e agora você pode sacar"
        },
        data: {
          screen: "Bank"
        },
        include_external_user_ids: [user.id]
      });
      await _prisma.default.notification.create({
        data: {
          title: "Conta Bancaria Ativa",
          message: "Seus dados foram confirmados e agora você pode sacar",
          type: "Bank",
          dataId: "",
          userId: user.id
        }
      });
      if (userType == "professional") {
        await _prisma.default.professional.update({
          where: {
            id: user.id
          },
          data: {
            recipientStatus: data["data"]["status"]
          }
        });
      } else {
        await _prisma.default.space.update({
          where: {
            id: user.id
          },
          data: {
            recipientStatus: data["data"]["status"]
          }
        });
      }
    } else {
      if (data["data"]["status"] != "registration" && data["data"]["status"] != "affiliation") {
        await client.createNotification({
          headings: {
            en: "Conta Bancaria Recusada",
            pt: "Conta Bancaria Recusada"
          },
          contents: {
            en: "Seus dados foram rejeitados, entre em contato conosco para te ajudarmos",
            pt: "Seus dados foram rejeitados, entre em contato conosco para te ajudarmos"
          },
          data: {
            screen: "Bank"
          },
          include_external_user_ids: [user.id]
        });
        await _prisma.default.notification.create({
          data: {
            title: "Conta Bancaria Recusad",
            message: "Seus dados foram rejeitados, entre em contato conosco para te ajudarmos",
            type: "Bank",
            dataId: "",
            userId: user.id
          }
        });
        if (userType == "professional") {
          await _prisma.default.professional.update({
            where: {
              id: user.id
            },
            data: {
              recipientStatus: data["data"]["status"]
            }
          });
        } else {
          await _prisma.default.space.update({
            where: {
              id: user.id
            },
            data: {
              recipientStatus: data["data"]["status"]
            }
          });
        }
      }
    }
    return data;
  }
}
exports.TransferNotificationService = TransferNotificationService;