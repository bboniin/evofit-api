"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinkProfessionalSpaceService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class LinkProfessionalSpaceService {
  async execute({
    userId,
    spaceId
  }) {
    const professional = await _prisma.default.professional.findUnique({
      where: {
        id: userId,
        isDeleted: false
      }
    });
    if (!professional) {
      throw new Error("Profissional não encontrado");
    }
    const space = await _prisma.default.space.findUnique({
      where: {
        id: spaceId,
        isDeleted: false
      }
    });
    if (!space) {
      throw new Error("Espaço não encontrado");
    }
    const link = await _prisma.default.professionalSpace.create({
      data: {
        professionalId: userId,
        spaceId: spaceId
      }
    });
    return link;
  }
}
exports.LinkProfessionalSpaceService = LinkProfessionalSpaceService;