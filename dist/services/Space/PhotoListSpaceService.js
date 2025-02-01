"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoListSpaceService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PhotoListSpaceService {
  async execute({
    userId
  }) {
    const photos = await _prisma.default.photosSpace.findMany({
      where: {
        userId: userId
      }
    });
    return photos;
  }
}
exports.PhotoListSpaceService = PhotoListSpaceService;