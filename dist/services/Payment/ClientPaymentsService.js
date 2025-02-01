"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientPaymentsService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ClientPaymentsService {
  async execute({
    userId
  }) {
    const client = await _prisma.default.client.findUnique({
      where: {
        id: userId
      },
      include: {
        user: true
      }
    });
    if (!client) {
      throw new Error('Usuário não encontrado');
    }
    const payments = await _prisma.default.payment.findMany({
      where: {
        clientId: client.id
      },
      orderBy: {
        date: "desc"
      },
      include: {
        space: true,
        professional: true
      }
    });
    return payments;
  }
}
exports.ClientPaymentsService = ClientPaymentsService;