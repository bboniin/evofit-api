"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoAddSpaceService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PhotoAddSpaceService {
  async execute({
    photo,
    userId
  }) {
    if (!photo) {
      throw new Error("Envie uma imagem para adicionar ao seu perfil");
    }
    const s3Storage = new _S3Storage.default();
    const photoSave = await s3Storage.saveFile(photo);
    const photoSpace = await _prisma.default.photosSpace.create({
      data: {
        userId: userId,
        photo: photoSave
      }
    });
    return photoSpace;
  }
}
exports.PhotoAddSpaceService = PhotoAddSpaceService;