"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetChatController = void 0;
var _GetChatService = require("../../services/Chat/GetChatService");
class GetChatController {
  async handle(req, res) {
    const userId = req.userId;
    const {
      recipientId
    } = req.params;
    const getChatService = new _GetChatService.GetChatService();
    const messages = await getChatService.execute({
      userId,
      recipientId
    });
    return res.json(messages);
  }
}
exports.GetChatController = GetChatController;