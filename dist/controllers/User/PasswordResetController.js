"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasswordResetController = void 0;
var _PasswordResetService = require("../../services/User/PasswordResetService");
class PasswordResetController {
  async handle(req, res) {
    const {
      id
    } = req.params;
    const {
      password
    } = req.body;
    const passwordResetService = new _PasswordResetService.PasswordResetService();
    const passwordForgot = await passwordResetService.execute({
      id,
      password
    });
    return res.json(passwordForgot);
  }
}
exports.PasswordResetController = PasswordResetController;