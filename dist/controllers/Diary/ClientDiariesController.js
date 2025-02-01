"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientDiariesController = void 0;
var _ClientDiariesService = require("../../services/Diary/ClientDiariesService");
class ClientDiariesController {
  async handle(req, res) {
    const clientId = req.userId;
    const clientDiariesService = new _ClientDiariesService.ClientDiariesService();
    const spaces = await clientDiariesService.execute({
      clientId: clientId
    });
    spaces.map(data => {
      if (data["photo"]) {
        data["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + data["photo"];
      }
    });
    return res.json(spaces);
  }
}
exports.ClientDiariesController = ClientDiariesController;