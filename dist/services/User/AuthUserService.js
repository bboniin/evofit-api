"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthUserService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _jsonwebtoken = require("jsonwebtoken");
var _auth = _interopRequireDefault(require("../../utils/auth"));
var _bcryptjs = require("bcryptjs");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class AuthUserService {
  async execute({
    email,
    password
  }) {
    if (!password || !email) {
      throw new Error("Email e Senha são obrigatórios");
    }
    const user = await _prisma.default.user.findFirst({
      where: {
        email: email
      },
      include: {
        space: {
          include: {
            spaceHours: true
          }
        },
        client: true,
        professional: {
          include: {
            workSchedules: true
          }
        }
      }
    });
    if (!user) {
      throw new Error("Email e Senha não correspondem ou não existe");
    }
    const passwordMatch = await (0, _bcryptjs.compare)(password, user.password);
    if (!passwordMatch) {
      throw new Error("Email e Senha não correspondem ou não existe");
    }
    const token = (0, _jsonwebtoken.sign)({
      email: user.email,
      role: user.role
    }, _auth.default.jwt.secret, {
      subject: user.id,
      expiresIn: '365d'
    });
    switch (user.role) {
      case "SPACE":
        {
          return {
            role: user.role,
            email: user.email,
            token: token,
            ...user.space
          };
        }
      case "CLIENT":
        {
          return {
            role: user.role,
            email: user.email,
            token: token,
            ...user.client
          };
        }
      case "PROFESSIONAL":
        {
          return {
            role: user.role,
            email: user.email,
            token: token,
            ...user.professional
          };
        }
    }
  }
}
exports.AuthUserService = AuthUserService;