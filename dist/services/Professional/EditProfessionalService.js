"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditProfessionalService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class EditProfessionalService {
  async execute({
    name,
    birthday,
    phoneNumber,
    photo,
    email,
    cref,
    description,
    valueConsultancy,
    userId,
    enableConsultancy,
    type,
    descriptionConsultancy,
    valueLesson,
    enableLesson
  }) {
    let data = {};
    const user = await _prisma.default.user.findUnique({
      where: {
        id: userId,
        role: "PROFESSIONAL"
      },
      include: {
        professional: true
      }
    });
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    const userData = {
      email: user.email,
      ...user.professional
    };
    if (type == "account") {
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
        cref: cref || userData.cref
      };
    }
    if (type == "profile") {
      if (!description || !photo && !userData.photo) {
        throw new Error("Foto de perfil e descrição são obrigatórios");
      }
      data = {
        description: description || userData.description,
        finishProfile: true
      };
    }
    if (type == "bank") {
      if (!enableLesson && !enableConsultancy) {
        throw new Error("Ative pelo menos um serviço");
      }
      if (enableLesson && !valueLesson) {
        throw new Error("Preencha valor e descrição da aula individual");
      }
      if (enableConsultancy && (!valueConsultancy || !descriptionConsultancy)) {
        throw new Error("Preencha valor e descrição da aula individual");
      }
      data = {
        valueConsultancy: valueConsultancy,
        enableConsultancy: enableConsultancy,
        descriptionConsultancy: descriptionConsultancy,
        valueLesson: valueLesson,
        enableLesson: enableLesson
      };
    }
    if (photo) {
      const s3Storage = new _S3Storage.default();
      const upload = await s3Storage.saveFile(photo);
      data["photo"] = upload;
      if (userData.photo) {
        await s3Storage.deleteFile(userData.photo);
      }
    }
    const userEdit = await _prisma.default.professional.update({
      where: {
        userId: userId
      },
      data: data,
      include: {
        workSchedules: true
      }
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
exports.EditProfessionalService = EditProfessionalService;