"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoAddProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PhotoAddProfessionalService {
  async execute({
    photo,
    userId
  }) {
    if (!photo) {
      throw new Error("Envie uma imagem para adicionar ao seu perfil");
    }
    const s3Storage = new _S3Storage.default();
    const photoSave = await s3Storage.saveFile(photo);
    const photoProfessional = await _prisma.default.photosProfessional.create({
      data: {
        userId: userId,
        photo: photoSave
      }
    });
    return photoProfessional;
  }
}
exports.PhotoAddProfessionalService = PhotoAddProfessionalService;