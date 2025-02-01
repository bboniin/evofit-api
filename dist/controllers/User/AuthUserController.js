"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthUserController = void 0;
var _AuthUserService = require("../../services/User/AuthUserService");
class AuthUserController {
  async handle(req, res) {
    const {
      email,
      password
    } = req.body;
    const authUserService = new _AuthUserService.AuthUserService();
    const user = await authUserService.execute({
      email,
      password
    });
    if (user["photo"]) {
      user["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + user["photo"];
    }
    return res.json(user);
  }
}
exports.AuthUserController = AuthUserController;