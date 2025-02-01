"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetRecipientService = void 0;
var _api = _interopRequireDefault(require("../../config/api"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetRecipientService {
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
      let recipient = {};
      await _api.default.get(`/recipients/${recipientId}`).then(response => {
        recipient = response.data;
      }).catch(e => {
        throw new Error("Ocorreu um erro ao obter conta bancária");
      });
      return recipient;
    } else {
      return {};
    }
  }
}
exports.GetRecipientService = GetRecipientService;