"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListNotificationsService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ListNotificationsService {
  async execute({
    userId
  }) {
    const notifications = await _prisma.default.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return notifications;
  }
}
exports.ListNotificationsService = ListNotificationsService;