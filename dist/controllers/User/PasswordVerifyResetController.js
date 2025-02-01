"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasswordVerifyResetController = void 0;
var _PasswordVerifyResetService = require("../../services/User/PasswordVerifyResetService");
class PasswordVerifyResetController {
  async handle(req, res) {
    const {
      code
    } = req.params;
    const {
      email
    } = req.body;
    const passwordVerifyResetService = new _PasswordVerifyResetService.PasswordVerifyResetService();
    const passwordForgot = await passwordVerifyResetService.execute({
      code,
      email
    });
    return res.json(passwordForgot);
  }
}
exports.PasswordVerifyResetController = PasswordVerifyResetController;