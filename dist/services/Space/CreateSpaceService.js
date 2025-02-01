"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateSpaceService = void 0;
var _bcryptjs = require("bcryptjs");
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
var _jsonwebtoken = require("jsonwebtoken");
var _auth = _interopRequireDefault(require("../../utils/auth"));
var _functions = require("../../config/functions");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateSpaceService {
  async execute({
    name,
    password,
    city,
    state,
    zipCode,
    neighborhood,
    address,
    number,
    complement,
    phoneNumber,
    typeUser,
    cpfOrCnpj,
    latitude,
    longitude,
    description,
    photo,
    email
  }) {
    if (!name || !phoneNumber || !password || !typeUser || !cpfOrCnpj || !neighborhood || !email || !city || !state || !zipCode || !longitude || !latitude || !address || !number) {
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
    const spaceGet = await _prisma.default.space.findFirst({
      where: {
        userId: null,
        isDeleted: false,
        OR: [{
          latitude: latitude,
          longitude: longitude
        }, {
          address: address,
          number: number
        }]
      }
    });
    const passwordHash = await (0, _bcryptjs.hash)(password, 8);
    let data = {
      name: name,
      phoneNumber: phoneNumber,
      cpfOrCnpj: cpfOrCnpjString,
      typeUser: typeUser,
      description: description,
      city: city,
      state: state,
      zipCode: zipCode,
      address: address,
      number: number,
      latitude: latitude,
      longitude: longitude,
      neighborhood: neighborhood,
      complement: complement
    };
    if (description && photo) {
      data["finishProfile"] = true;
    }
    if (photo) {
      const s3Storage = new _S3Storage.default();
      const upload = await s3Storage.saveFile(photo);
      data["photo"] = upload;
    }
    if (spaceGet) {
      const user = await _prisma.default.user.create({
        data: {
          email: email,
          password: passwordHash,
          role: "SPACE",
          id: spaceGet.id
        }
      });
      const space = await _prisma.default.space.update({
        where: {
          id: spaceGet.id
        },
        data: {
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
        ...space
      };
    } else {
      const user = await _prisma.default.user.create({
        data: {
          email: email,
          password: passwordHash,
          role: "SPACE"
        }
      });
      const space = await _prisma.default.space.create({
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
        ...space
      };
    }
  }
}
exports.CreateSpaceService = CreateSpaceService;