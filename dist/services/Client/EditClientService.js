"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditClientService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class EditClientService {
  async execute({
    name,
    birthday,
    phoneNumber,
    cpf,
    objective,
    experienceLevel,
    photo,
    email,
    userId
  }) {
    let data = {};
    const user = await _prisma.default.user.findUnique({
      where: {
        id: userId,
        role: "CLIENT"
      },
      include: {
        client: true
      }
    });
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    const userData = {
      email: user.email,
      ...user.client
    };
    if (email) {
      const userAlreadyExists = await _prisma.default.user.findFirst({
        where: {
          email: email
        }
      });
      if (userAlreadyExists) {
        if (userAlreadyExists.id != userId) {
          throw new Error("Email já cadastrado");
        }
      }
    }
    data = {
      name: name || userData.name,
      birthday: birthday ? new Date(birthday) : userData.birthday,
      phoneNumber: phoneNumber || userData.phoneNumber,
      objective: objective || userData.objective,
      experienceLevel: experienceLevel || userData.experienceLevel,
      cpf: cpf || userData.cpf
    };
    if (photo) {
      const s3Storage = new _S3Storage.default();
      const upload = await s3Storage.saveFile(photo);
      data["photo"] = upload;
      if (userData.photo) {
        await s3Storage.deleteFile(userData.photo);
      }
    }
    const userEdit = await _prisma.default.client.update({
      where: {
        userId: userId
      },
      data: data
    });
    if (email && email != userData.email) {
      await _prisma.default.user.update({
        where: {
          id: userId
        },
        data: {
          email: email
        }
      });
    }
    return {
      role: user.role,
      email: email || user.email,
      ...userEdit
    };
  }
}
exports.EditClientService = EditClientService;