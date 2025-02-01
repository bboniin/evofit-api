"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateProfessionalService = void 0;
var _bcryptjs = require("bcryptjs");
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
var _jsonwebtoken = require("jsonwebtoken");
var _auth = _interopRequireDefault(require("../../utils/auth"));
var _functions = require("../../config/functions");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateProfessionalService {
  async execute({
    name,
    password,
    birthday,
    phoneNumber,
    typeUser,
    cpfOrCnpj,
    cref,
    photo,
    email,
    description
  }) {
    if (!name || !phoneNumber || !password || !typeUser || !cpfOrCnpj || !cref || !email || !birthday) {
      throw new Error("Preencha todos os campos obrigatórios");
    }
    const userAlreadyExists = await _prisma.default.user.findFirst({
      where: {
        email: email
      }
    });
    if (userAlreadyExists) {
      throw new Error("Email já cadastrado");
    }
    const cpfOrCnpjString = cpfOrCnpj.replace(/\D/g, "");
    if (typeUser == "PF") {
      if (!(0, _functions.validateCpf)(cpfOrCnpjString)) {
        throw new Error("CPF inválido");
      }
    } else {
      if (typeUser == "PJ") {
        if (!(0, _functions.validateCnpj)(cpfOrCnpjString)) {
          throw new Error("CNPJ inválido");
        }
      }
    }
    const userAlreadyExistsCPF = await _prisma.default.user.findFirst({
      where: {
        OR: [{
          space: {
            cpfOrCnpj: cpfOrCnpjString
          }
        }, {
          client: {
            cpf: cpfOrCnpjString
          }
        }, {
          professional: {
            cpfOrCnpj: cpfOrCnpjString
          }
        }]
      }
    });
    if (userAlreadyExistsCPF) {
      throw new Error(typeUser == "PF" ? "CPF já está em uso" : "CNPJ já está em uso");
    }
    if (!(0, _functions.validateEmail)(email)) {
      throw new Error("Email inválido");
    }
    if (!(0, _functions.validatePhone)(phoneNumber)) {
      throw new Error("Telefone inválido");
    }
    const passwordHash = await (0, _bcryptjs.hash)(password, 8);
    let data = {
      name: name,
      birthday: new Date(birthday),
      phoneNumber: phoneNumber,
      cpfOrCnpj: cpfOrCnpjString,
      typeUser: typeUser,
      cref: cref,
      description: description,
      photo: ""
    };
    if (description && photo) {
      data["finishProfile"] = true;
    }
    if (photo) {
      const s3Storage = new _S3Storage.default();
      const upload = await s3Storage.saveFile(photo);
      data["photo"] = upload;
    }
    const user = await _prisma.default.user.create({
      data: {
        email: email,
        password: passwordHash,
        role: "PROFESSIONAL"
      }
    });
    const professional = await _prisma.default.professional.create({
      data: {
        id: user.id,
        userId: user.id,
        ...data
      }
    });
    const token = (0, _jsonwebtoken.sign)({
      email: user.email,
      role: user.role
    }, _auth.default.jwt.secret, {
      subject: user.id,
      expiresIn: "365d"
    });
    return {
      role: user.role,
      email: user.email,
      token: token,
      ...professional
    };
  }
}
exports.CreateProfessionalService = CreateProfessionalService;