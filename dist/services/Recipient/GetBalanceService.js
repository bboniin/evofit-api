"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetBalanceService = void 0;
var _api = _interopRequireDefault(require("../../config/api"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetBalanceService {
  async execute({
    userId
  }) {
    const spaceOrProfessional = await _prisma.default.user.findUnique({
      where: {
        id: userId
      },
      include: {
        space: true,
        professional: true
      }
    });
    if (!spaceOrProfessional) {
      throw new Error("Usuário não encontrado");
    } else {
      if (!spaceOrProfessional.space && !spaceOrProfessional.professional) {
        throw new Error("Usuário não encontrado");
      }
    }
    const user = spaceOrProfessional.space || spaceOrProfessional.professional;
    let balance = {};
    await _api.default.get(`/recipients/${user.recipientId}/balance`).then(response => {
      balance = response.data;
    }).catch(e => {
      throw new Error("Ocorreu um erro ao obter informações do pedido");
    });
    const payments = await _prisma.default.payment.findMany({
      where: {
        OR: [{
          spaceId: userId
        }, {
          professionalId: userId
        }],
        status: {
          not: "cancelled"
        }
      },
      orderBy: {
        date: "desc"
      },
      include: {
        client: true,
        items: true
      }
    });
    payments.map(item => {
      if (item.type == "multiple") {
        if (spaceOrProfessional.role == "PROFESSIONAL") {
          item.value = item.items.find(data => data.type == "lesson").value || 0;
        } else {
          item.value = item.items.find(data => data.type == "diary").value || 0;
        }
      }
    });
    return {
      balance: balance,
      payments: payments
    };
  }
}
exports.GetBalanceService = GetBalanceService;