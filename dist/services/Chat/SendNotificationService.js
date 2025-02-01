"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SendNotificationService = void 0;
var OneSignal = _interopRequireWildcard(require("onesignal-node"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class SendNotificationService {
  async execute({
    message,
    recipientId
  }) {
    const client = new OneSignal.Client("15ee78c4-6dab-4cb5-a606-1bb5b12170e1", "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw");
    await client.createNotification({
      headings: {
        en: "Nova mensagem",
        pt: "Nova mensagem"
      },
      contents: {
        en: message["content"],
        pt: message["content"]
      },
      data: {
        screen: "Chat",
        params: {
          id: message["id"]
        }
      },
      include_external_user_ids: [recipientId]
    });
    await _prisma.default.notification.create({
      data: {
        title: "Nova mensagem",
        message: message["content"],
        type: "Chat",
        dataId: message["id"],
        userId: recipientId
      }
    });
    return message;
  }
}
exports.SendNotificationService = SendNotificationService;