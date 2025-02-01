"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasswordForgotController = void 0;
var _PasswordForgotService = require("../../services/User/PasswordForgotService");
class PasswordForgotController {
  async handle(req, res) {
    const {
      email
    } = req.body;
    const passwordForgotService = new _PasswordForgotService.PasswordForgotService();
    const passwordForgot = await passwordForgotService.execute({
      email
    });
    return res.json(passwordForgot);
  }
}
exports.PasswordForgotController = PasswordForgotController;