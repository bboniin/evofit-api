"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListLinkedSpacesService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ListLinkedSpacesService {
  async execute({
    userId
  }) {
    const spacesLinks = await _prisma.default.professionalSpace.findMany({
      where: {
        professionalId: userId
      },
      include: {
        space: {
          include: {
            spaceHours: true
          }
        }
      }
    });
    return spacesLinks;
  }
}
exports.ListLinkedSpacesService = ListLinkedSpacesService;