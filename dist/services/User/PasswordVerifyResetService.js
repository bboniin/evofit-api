"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasswordVerifyResetService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _dateFns = require("date-fns");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PasswordVerifyResetService {
  async execute({
    code,
    email
  }) {
    const passwordCode = await _prisma.default.passwordForgot.findFirst({
      where: {
        code: code,
        email: email
      }
    });
    if (!passwordCode) {
      throw new Error("Código inválido");
    }
    if (passwordCode.used) {
      throw new Error("Código já foi utilizado");
    }
    const dateCreated = passwordCode.createdAt;
    const dateLimit = (0, _dateFns.addHours)(dateCreated, 2);
    const isCodeExpired = (0, _dateFns.isAfter)(new Date(), dateLimit);
    if (isCodeExpired) {
      throw new Error("Código expirado");
    }
    const user = await _prisma.default.user.findFirst({
      where: {
        email: passwordCode.email
      }
    });
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    return passwordCode;
  }
}
exports.PasswordVerifyResetService = PasswordVerifyResetService;