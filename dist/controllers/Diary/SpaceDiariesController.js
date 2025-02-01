"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpaceDiariesController = void 0;
var _SpaceDiariesService = require("../../services/Diary/SpaceDiariesService");
class SpaceDiariesController {
  async handle(req, res) {
    const spaceId = req.userId;
    const spaceDiariesService = new _SpaceDiariesService.SpaceDiariesService();
    const clients = await spaceDiariesService.execute({
      spaceId: spaceId
    });
    clients.map(item => {
      if (item["photo"]) {
        item["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
      }
    });
    return res.json(clients);
  }
}
exports.SpaceDiariesController = SpaceDiariesController;