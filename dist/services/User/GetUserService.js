"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetUserService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetUserService {
  async execute({
    userId
  }) {
    const user = await _prisma.default.user.findUnique({
      where: {
        id: userId
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
      throw new Error("Usuário não encontrado");
    }
    switch (user.role) {
      case "SPACE":
        {
          return {
            role: user.role,
            email: user.email,
            ...user.space
          };
        }
      case "CLIENT":
        {
          return {
            role: user.role,
            email: user.email,
            ...user.client
          };
        }
      case "PROFESSIONAL":
        {
          return {
            role: user.role,
            email: user.email,
            ...user.professional
          };
        }
    }
  }
}
exports.GetUserService = GetUserService;