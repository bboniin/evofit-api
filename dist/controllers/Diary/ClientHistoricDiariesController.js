"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientHistoricDiariesController = void 0;
var _ClientHistoricDiariesService = require("../../services/Diary/ClientHistoricDiariesService");
class ClientHistoricDiariesController {
  async handle(req, res) {
    const userId = req.userId;
    const clientHistoricDiariesService = new _ClientHistoricDiariesService.ClientHistoricDiariesService();
    const diaries = await clientHistoricDiariesService.execute({
      userId: userId
    });
    diaries.map(data => {
      if (data.space["photo"]) {
        data.space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + data.space["photo"];
      }
    });
    return res.json(diaries);
  }
}
exports.ClientHistoricDiariesController = ClientHistoricDiariesController;