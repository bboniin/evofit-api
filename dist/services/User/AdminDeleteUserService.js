"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdminDeleteUserService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class AdminDeleteUserService {
  async execute({
    userId,
    idDelete
  }) {
    const user = await _prisma.default.user.findFirst({
      where: {
        id: userId
      }
    });
    if (!user) {
      throw new Error("Usuário não foi encontrado");
    }
    if (user.email != "huwelder@hotmail.com") {
      throw new Error("Usuário não é administrador");
    }
    const userDelete = await _prisma.default.user.findFirst({
      where: {
        id: idDelete
      }
    });
    if (userDelete) {
      await _prisma.default.user.delete({
        where: {
          id: idDelete
        }
      });
    }
    switch (userDelete.role) {
      case "CLIENT":
        {
          await _prisma.default.client.update({
            where: {
              id: userDelete.id
            },
            data: {
              isDeleted: true
            }
          });
          await _prisma.default.clientsProfessional.updateMany({
            where: {
              clientId: userDelete.id
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
              id: userDelete.id
            },
            data: {
              isDeleted: true
            }
          });
          await _prisma.default.clientsProfessional.updateMany({
            where: {
              professionalId: userDelete.id
            },
            data: {
              status: "cancelled"
            }
          });
        }
      default:
        {
          await _prisma.default.space.update({
            where: {
              id: userDelete.id
            },
            data: {
              isDeleted: true
            }
          });
        }
    }
  }
}
exports.AdminDeleteUserService = AdminDeleteUserService;