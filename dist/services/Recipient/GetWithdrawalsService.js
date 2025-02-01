"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetWithdrawalsService = void 0;
var _api = _interopRequireDefault(require("../../config/api"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetWithdrawalsService {
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
      throw new Error('Usuário não encontrado');
    } else {
      if (!spaceOrProfessional.space && !spaceOrProfessional.professional) {
        throw new Error('Usuário não encontrado');
      }
    }
    const user = spaceOrProfessional.space || spaceOrProfessional.professional;
    let withdrawals = {};
    await _api.default.get(`/recipients/${user.recipientId}/withdrawals`).then(response => {
      withdrawals = response.data;
    }).catch(e => {
      throw new Error('Ocorreu um erro ao obter informações do pedido');
    });
    return {
      withdrawals: withdrawals
    };
  }
}
exports.GetWithdrawalsService = GetWithdrawalsService;