"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeleteUserService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _bcryptjs = require("bcryptjs");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DeleteUserService {
  async execute({
    password,
    userId
  }) {
    if (!password) {
      throw new Error("Email é obrigatório");
    }
    const user = await _prisma.default.user.findFirst({
      where: {
        id: userId
      },
      include: {
        space: true,
        client: true,
        professional: true
      }
    });
    if (!user) {
      throw new Error("Usuário não foi encontrado");
    }
    const passwordMatch = await (0, _bcryptjs.compare)(password, user.password);
    if (!passwordMatch) {
      throw new Error("Senha está incorreta");
    }
    await _prisma.default.user.delete({
      where: {
        id: userId
      }
    });
    switch (user.role) {
      case "CLIENT":
        {
          await _prisma.default.client.update({
            where: {
              id: user.id
            },
            data: {
              isDeleted: true
            }
          });
          await _prisma.default.clientsProfessional.updateMany({
            where: {
              clientId: user.id
            },
            data: {
              status: "cancelled"
            }
          });
        }
      case "PROFESSIONAL":
        {
          await _prisma.default.professional.update({
            where: {
              id: user.id
            },
            data: {
              isDeleted: true
            }
          });
          await _prisma.default.clientsProfessional.updateMany({
            where: {
              professionalId: user.id
            },
            data: {
              status: "cancelled"
            }
          });
        }
      case "SPACE":
        {
          await _prisma.default.space.update({
            where: {
              id: user.id
            },
            data: {
              isDeleted: true
            }
          });
        }
    }
  }
}
exports.DeleteUserService = DeleteUserService;