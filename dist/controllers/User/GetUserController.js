"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetUserController = void 0;
var _GetUserService = require("../../services/User/GetUserService");
class GetUserController {
  async handle(req, res) {
    let userId = req.userId;
    const getUserService = new _GetUserService.GetUserService();
    const user = await getUserService.execute({
      userId
    });
    if (user["photo"]) {
      user["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + user["photo"];
    }
    return res.json(user);
  }
}
exports.GetUserController = GetUserController;