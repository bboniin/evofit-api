"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SendMessageService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class SendMessageService {
  async execute({
    userId,
    recipientId,
    userType,
    content
  }) {
    let chat = await _prisma.default.chat.findFirst({
      where: userType == "CLIENT" ? {
        clientId: userId,
        professionalId: recipientId
      } : {
        clientId: recipientId,
        professionalId: userId
      }
    });
    if (!chat) {
      chat = await _prisma.default.chat.create({
        data: {
          clientId: userType == "CLIENT" ? userId : recipientId,
          professionalId: userType == "CLIENT" ? recipientId : userId
        }
      });
    }
    const message = await _prisma.default.message.create({
      data: {
        chatId: chat.id,
        userId: userId,
        content: content
      },
      include: {
        chat: {
          include: {
            client: true,
            professional: true
          }
        }
      }
    });
    return message;
  }
}
exports.SendMessageService = SendMessageService;