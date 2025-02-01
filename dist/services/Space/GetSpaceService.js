"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetSpaceService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetSpaceService {
  async execute({
    spaceId
  }) {
    const space = await _prisma.default.space.findUnique({
      where: {
        id: spaceId,
        isDeleted: false
      },
      include: {
        photos: true,
        professionals: {
          where: {
            professional: {
              OR: [{
                recipientStatus: "registration"
              }, {
                recipientStatus: "affiliation"
              }, {
                recipientStatus: "active"
              }],
              finishProfile: true,
              isDeleted: false
            }
          },
          include: {
            professional: true
          }
        },
        spaceHours: true
      }
    });
    if (!space) {
      throw new Error("Espaço não encontrado ou excluido");
    }
    return space;
  }
}
exports.GetSpaceService = GetSpaceService;