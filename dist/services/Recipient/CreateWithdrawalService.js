"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateWithdrawalService = void 0;
var _api = _interopRequireDefault(require("../../config/api"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateWithdrawalService {
  async execute({
    userId,
    value
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
    await _api.default.post(`/recipients/${user.recipientId}/withdrawals`, {
      amount: value
    }).then(response => {
      withdrawals = response.data;
    }).catch(e => {
      console.log(e.response.data);
      throw new Error('Ocorreu um erro ao obter informações do pedido');
    });
    return {
      withdrawals: withdrawals
    };
  }
}
exports.CreateWithdrawalService = CreateWithdrawalService;