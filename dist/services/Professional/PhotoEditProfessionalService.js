"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoEditProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PhotoEditProfessionalService {
  async execute({
    photo,
    id
  }) {
    if (!photo) {
      throw new Error("Envie uma imagem para adicionar ao seu perfil");
    }
    const photoExist = await _prisma.default.photosProfessional.findUnique({
      where: {
        id: id
      }
    });
    if (!photoExist) {
      throw new Error("Imagem não encontrada");
    }
    const s3Storage = new _S3Storage.default();
    await s3Storage.deleteFile(photoExist.photo);
    const photoSave = await s3Storage.saveFile(photo);
    const photoProfessional = await _prisma.default.photosProfessional.update({
      where: {
        id: id
      },
      data: {
        photo: photoSave
      }
    });
    return photoProfessional;
  }
}
exports.PhotoEditProfessionalService = PhotoEditProfessionalService;