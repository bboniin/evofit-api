"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpaceDiariesService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class SpaceDiariesService {
  async execute({
    spaceId
  }) {
    const space = await _prisma.default.space.findUnique({
      where: {
        id: spaceId,
        isDeleted: false
      }
    });
    if (!space) {
      throw new Error("Espaço não encontrado");
    }
    const clients = await _prisma.default.client.findMany({
      where: {
        diaries: {
          some: {
            spaceId: space.id,
            used: false
          }
        }
      },
      orderBy: {
        name: "asc"
      },
      include: {
        diaries: {
          where: {
            used: false
          }
        }
      }
    });
    return clients;
  }
}
exports.SpaceDiariesService = SpaceDiariesService;