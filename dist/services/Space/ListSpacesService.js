"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListSpacesService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ListSpacesService {
  async execute({
    minLatitude,
    minLongitude,
    maxLatitude,
    maxLongitude
  }) {
    const spaces = await _prisma.default.space.findMany({
      where: {
        isDeleted: false,
        latitude: {
          gte: minLatitude,
          lte: maxLatitude
        },
        longitude: {
          gte: minLongitude,
          lte: maxLongitude
        }
      },
      include: {
        photos: true,
        professionals: {
          where: {
            professional: {
              OR: [{
                recipientStatus: "registration"
              }, {
                recipientStatus: "affiliation"
              }, {
                recipientStatus: "active"
              }],
              finishProfile: true,
              isDeleted: false
            }
          },
          include: {
            professional: true
          }
        }
      }
    });
    return spaces;
  }
}
exports.ListSpacesService = ListSpacesService;