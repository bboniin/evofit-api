"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateRatingService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateRatingService {
  async execute({
    userId,
    rate,
    spaceId,
    professionalId
  }) {
    if (!spaceId && !professionalId) {
      throw new Error("Id do avaliado não enviado");
    }
    const ratingGet = await _prisma.default.rating.findFirst({
      where: spaceId ? {
        clientId: userId,
        spaceId: spaceId
      } : {
        clientId: userId,
        professionalId: professionalId
      }
    });
    if (ratingGet) {
      throw new Error(`Você já avaliou esse ${spaceId ? "espaço" : "profissional"}`);
    }
    const rating = await _prisma.default.rating.create({
      data: {
        clientId: userId,
        spaceId: spaceId,
        professionalId: professionalId,
        rate: rate,
        description: ""
      }
    });
    return rating;
  }
}
exports.CreateRatingService = CreateRatingService;