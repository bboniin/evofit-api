"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientDiariesService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ClientDiariesService {
  async execute({
    clientId
  }) {
    const client = await _prisma.default.client.findUnique({
      where: {
        userId: clientId,
        isDeleted: false
      }
    });
    if (!client) {
      throw new Error("Cliente não encontrado");
    }
    const spaces = await _prisma.default.space.findMany({
      where: {
        diaries: {
          some: {
            clientId: clientId,
            used: false
          }
        }
      },
      include: {
        diaries: {
          where: {
            clientId: clientId,
            used: false
          }
        }
      }
    });
    return spaces;
  }
}
exports.ClientDiariesService = ClientDiariesService;