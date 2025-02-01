"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditPasswordUserService = void 0;
var _bcryptjs = require("bcryptjs");
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class EditPasswordUserService {
  async execute({
    old_password,
    new_password,
    userId
  }) {
    if (!old_password || !new_password) {
      throw new Error("Antiga e Nova Senha são obrigatórios");
    }
    const user = await _prisma.default.user.findUnique({
      where: {
        id: userId
      }
    });
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    const passwordMatch = await (0, _bcryptjs.compare)(old_password, user.password);
    if (passwordMatch) {
      throw new Error("Senha antiga está incorreta");
    }
    const passwordHash = await (0, _bcryptjs.hash)(new_password, 8);
    const userEdit = await _prisma.default.user.update({
      where: {
        id: userId
      },
      data: {
        password: passwordHash
      }
    });
    return userEdit;
  }
}
exports.EditPasswordUserService = EditPasswordUserService;