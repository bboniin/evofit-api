"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UpdateRecipientService = void 0;
var _api = _interopRequireDefault(require("../../config/api"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class UpdateRecipientService {
  async execute({
    userId,
    bank,
    type,
    branch,
    account
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
    const userType = user.typeUser == "PJ" ? "corporation" : "individual";
    const [account_number, account_check_digit] = account.split("-");
    const [branch_number, branch_check_digit] = branch.split("-");
    await _api.default.patch(`/recipients/${user.recipientId}/default-bank-account`, {
      bank_account: {
        holder_name: user.name,
        holder_type: userType,
        holder_document: user.cpfOrCnpj,
        bank: bank,
        branch_number: branch_number,
        branch_check_digit: branch_check_digit || "",
        account_number: account_number,
        account_check_digit: account_check_digit,
        type: type
      }
    }).then(() => {
      return {
        message: "Conta atualizada"
      };
    }).catch(e => {
      throw new Error("Ocorreu um erro ao editar conta bancária");
    });
  }
}
exports.UpdateRecipientService = UpdateRecipientService;