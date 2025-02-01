"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListChatsService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ListChatsService {
  async execute({
    userId
  }) {
    const chats = await _prisma.default.chat.findMany({
      where: {
        OR: [{
          clientId: userId
        }, {
          professionalId: userId
        }]
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc"
          }
        },
        client: true,
        professional: true
      }
    });
    return chats;
  }
}
exports.ListChatsService = ListChatsService;