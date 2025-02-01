"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenNotificationsService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class OpenNotificationsService {
  async execute({
    userId
  }) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const deletedNotifications = await _prisma.default.notification.updateMany({
      where: {
        userId: userId
      },
      data: {
        open: true,
        dateOpen: new Date()
      }
    });
    return deletedNotifications;
  }
}
exports.OpenNotificationsService = OpenNotificationsService;