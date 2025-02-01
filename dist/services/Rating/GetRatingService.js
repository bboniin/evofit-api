"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetRatingService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetRatingService {
  async execute({
    userId,
    professionalId,
    spaceId
  }) {
    if (!spaceId && !professionalId) {
      throw new Error('Id do avaliado não enviado');
    }
    const rating = await _prisma.default.rating.findFirst({
      where: spaceId ? {
        clientId: userId,
        spaceId: spaceId
      } : {
        clientId: userId,
        professionalId: professionalId
      }
    });
    if (rating) {
      return true;
    } else {
      return false;
    }
  }
}
exports.GetRatingService = GetRatingService;