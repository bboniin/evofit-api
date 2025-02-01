"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenNotificationsController = void 0;
var _OpenNotificationsService = require("../../services/Notification/OpenNotificationsService");
class OpenNotificationsController {
  async handle(req, res) {
    const openNotificationsService = new _OpenNotificationsService.OpenNotificationsService();
    const userId = req.userId;
    const notifications = await openNotificationsService.execute({
      userId
    });
    return res.json(notifications);
  }
}
exports.OpenNotificationsController = OpenNotificationsController;