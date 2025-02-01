"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfirmRecipientService = void 0;
var _api = _interopRequireDefault(require("../../config/api"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ConfirmRecipientService {
  async execute({
    userId,
    recipientId
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
    if (!spaceOrProfessional.space && !spaceOrProfessional.professional) {
      throw new Error("Usuário não encontrado");
    }
    const myRecipient = spaceOrProfessional.space?.recipientId == recipientId || spaceOrProfessional.professional?.recipientId == recipientId;
    if (myRecipient) {
      let confirmed = {};
      await _api.default.post(`/recipients/${recipientId}/kyc_link`).then(response => {
        confirmed = response.data;
      }).catch(e => {
        console.log(e.response.data);
        throw new Error("Ocorreu um erro ao enviar link para confirmedação de identidade");
      });
      return confirmed;
    } else {
      throw new Error("Ocorreu um erro ao enviar link para confirmação de identidade");
    }
  }
}
exports.ConfirmRecipientService = ConfirmRecipientService;