"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListNotificationsController = void 0;
var _ListNotificationsService = require("../../services/Notification/ListNotificationsService");
class ListNotificationsController {
  async handle(req, res) {
    const listNotificationsService = new _ListNotificationsService.ListNotificationsService();
    const userId = req.userId;
    const notifications = await listNotificationsService.execute({
      userId
    });
    return res.json(notifications);
  }
}
exports.ListNotificationsController = ListNotificationsController;