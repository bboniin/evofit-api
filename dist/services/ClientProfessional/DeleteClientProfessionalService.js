"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeleteClientProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DeleteClientProfessionalService {
  async execute({
    clientId,
    professionalId
  }) {
    const clientAlreadyExists = await _prisma.default.clientsProfessional.findFirst({
      where: {
        id: clientId
      }
    });
    if (!clientAlreadyExists) {
      throw new Error("Cliente não encontrado");
    }
    if (clientAlreadyExists.status == "registration_pending") {
      await _prisma.default.clientsProfessional.delete({
        where: {
          id: clientId
        }
      });
    } else {
      await _prisma.default.clientsProfessional.update({
        where: {
          id: clientId
        },
        data: {
          status: "cancelled",
          clientId: null,
          email: clientAlreadyExists.id + "/" + clientAlreadyExists.email
        }
      });
    }
    return "Deletado com sucesso";
  }
}
exports.DeleteClientProfessionalService = DeleteClientProfessionalService;