"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoListProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PhotoListProfessionalService {
  async execute({
    userId
  }) {
    const photos = await _prisma.default.photosProfessional.findMany({
      where: {
        userId: userId
      }
    });
    return photos;
  }
}
exports.PhotoListProfessionalService = PhotoListProfessionalService;