"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListClientsProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ListClientsProfessionalService {
  async execute({
    userId
  }) {
    const clients = await _prisma.default.clientsProfessional.findMany({
      where: {
        professionalId: userId,
        visible: true,
        status: {
          not: "cancelled"
        }
      },
      include: {
        client: true,
        space: true
      }
    });
    return clients;
  }
}
exports.ListClientsProfessionalService = ListClientsProfessionalService;