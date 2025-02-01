"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoRemoveProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PhotoRemoveProfessionalService {
  async execute({
    id,
    userId
  }) {
    const photo = await _prisma.default.photosProfessional.findUnique({
      where: {
        id: id,
        userId: userId
      }
    });
    if (!photo) {
      throw new Error("Imagem não encontrada");
    }
    const s3Storage = new _S3Storage.default();
    await s3Storage.deleteFile(photo.photo);
    await _prisma.default.photosProfessional.delete({
      where: {
        id: id
      }
    });
    return "Imagem deletada com sucesso";
  }
}
exports.PhotoRemoveProfessionalService = PhotoRemoveProfessionalService;