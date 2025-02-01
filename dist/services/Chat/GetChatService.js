"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetChatService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetChatService {
  async execute({
    userId,
    recipientId
  }) {
    const chat = await _prisma.default.chat.findFirst({
      where: {
        OR: [{
          clientId: userId,
          professionalId: recipientId
        }, {
          clientId: recipientId,
          professionalId: userId
        }]
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });
    if (chat) {
      return chat.messages;
    } else {
      return [];
    }
  }
}
exports.GetChatService = GetChatService;