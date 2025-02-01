"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpaceHistoricDiariesController = void 0;
var _SpaceHistoricDiariesService = require("../../services/Diary/SpaceHistoricDiariesService");
class SpaceHistoricDiariesController {
  async handle(req, res) {
    const userId = req.userId;
    const spaceHistoricDiariesService = new _SpaceHistoricDiariesService.SpaceHistoricDiariesService();
    const diaries = await spaceHistoricDiariesService.execute({
      userId: userId
    });
    diaries.map(data => {
      if (data.client["photo"]) {
        data.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + data.client["photo"];
      }
    });
    return res.json(diaries);
  }
}
exports.SpaceHistoricDiariesController = SpaceHistoricDiariesController;