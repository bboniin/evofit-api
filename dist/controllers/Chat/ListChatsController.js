"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListChatsController = void 0;
var _ListChatsService = require("../../services/Chat/ListChatsService");
class ListChatsController {
  async handle(req, res) {
    const userId = req.userId;
    const listChatsService = new _ListChatsService.ListChatsService();
    const chats = await listChatsService.execute({
      userId
    });
    chats.map(item => {
      if (item.client?.photo) {
        item.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.client.photo;
      }
      if (item.professional?.photo) {
        item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional.photo;
      }
    });
    return res.json(chats);
  }
}
exports.ListChatsController = ListChatsController;