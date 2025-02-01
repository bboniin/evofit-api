"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasswordResetService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _bcryptjs = require("bcryptjs");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PasswordResetService {
  async execute({
    id,
    password
  }) {
    const passwordCode = await _prisma.default.passwordForgot.findUnique({
      where: {
        id: id
      }
    });
    if (!passwordCode) {
      throw new Error('Código inválido');
    }
    if (passwordCode.used) {
      throw new Error('Código já foi utilizado');
    }
    const user = await _prisma.default.user.findUnique({
      where: {
        email: passwordCode.email
      }
    });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    const hashedPassword = await (0, _bcryptjs.hash)(password, 8);
    await _prisma.default.user.update({
      where: {
        id: user.id
      },
      data: {
        password: hashedPassword
      }
    });
    await _prisma.default.passwordForgot.update({
      where: {
        id: id
      },
      data: {
        used: true
      }
    });
    return {
      message: "Senha alterada com sucesso"
    };
  }
}
exports.PasswordResetService = PasswordResetService;