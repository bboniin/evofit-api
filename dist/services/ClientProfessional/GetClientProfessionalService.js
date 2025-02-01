"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetClientProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetClientProfessionalService {
  async execute({
    clientId,
    userId
  }) {
    const client = await _prisma.default.clientsProfessional.findUnique({
      where: {
        id: clientId,
        professionalId: userId
      },
      include: {
        space: true,
        client: {
          include: {
            payments: {
              where: {
                professionalId: userId,
                recurring: true
              }
            }
          }
        },
        schedules: {
          orderBy: {
            dayOfWeek: "asc"
          }
        }
      }
    });
    return client;
  }
}
exports.GetClientProfessionalService = GetClientProfessionalService;