"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetProfessionalService {
  async execute({
    professionalId
  }) {
    const professional = await _prisma.default.professional.findUnique({
      where: {
        userId: professionalId,
        isDeleted: false
      },
      include: {
        photos: true,
        clientsProfessional: {
          where: {
            clientId: {
              not: null
            }
          },
          include: {
            client: true
          }
        }
      }
    });
    if (!professional) {
      throw new Error("Profissional não encontrado ou excluido");
    }
    professional["clientsTotal"] = professional.clientsProfessional.length;
    professional.clientsProfessional = professional.clientsProfessional.slice(0, 4);
    return professional;
  }
}
exports.GetProfessionalService = GetProfessionalService;