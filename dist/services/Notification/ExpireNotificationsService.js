"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpireNotificationsService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ExpireNotificationsService {
  async execute() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const deletedNotifications = await _prisma.default.notification.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo
        }
      }
    });
    return deletedNotifications;
  }
}
exports.ExpireNotificationsService = ExpireNotificationsService;