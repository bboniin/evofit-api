import { hash } from "bcryptjs";
import prismaClient from "../../prisma";
import S3Storage from "../../utils/S3Storage";
import { sign } from "jsonwebtoken";
import authConfig from "../../utils/auth";
import {
  validateCnpj,
  validateCpf,
  validateEmail,
  validatePhone,
} from "../../config/functions";

interface ProfessionalRequest {
  name: string;
  photo: string;
  phoneNumber: string;
  email: string;
  typeUser: string;
  cpfOrCnpj: string;
  birthday: Date;
  password: string;
  cref: string;
  description: string;
}

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
    description,
  }: ProfessionalRequest) {
    if (
      !name ||
      !phoneNumber ||
      !password ||
      !typeUser ||
      !cpfOrCnpj ||
      !cref ||
      !email ||
      !birthday
    ) {
      throw new Error("Preencha todos os campos obrigatórios");
    }

    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    if (userAlreadyExists) {
      throw new Error("Email já cadastrado");
    }

    const cpfOrCnpjString = cpfOrCnpj.replace(/\D/g, "");

    if (typeUser == "PF") {
      if (!validateCpf(cpfOrCnpjString)) {
        throw new Error("CPF inválido");
      }
    } else {
      if (typeUser == "PJ") {
        if (!validateCnpj(cpfOrCnpjString)) {
          throw new Error("CNPJ inválido");
        }
      }
    }

    if (!validateEmail(email)) {
      throw new Error("Email inválido");
    }

    if (!validatePhone(phoneNumber)) {
      throw new Error("Telefone inválido");
    }

    const passwordHash = await hash(password, 8);

    let data = {
      name: name,
      birthday: new Date(birthday),
      phoneNumber: phoneNumber,
      cpfOrCnpj: cpfOrCnpj.replace(/\D/g, ""),
      typeUser: typeUser,
      cref: cref,
      description: description,
      photo: "",
    };

    if (photo) {
      const s3Storage = new S3Storage();

      const upload = await s3Storage.saveFile(photo);

      data["photo"] = upload;
    }

    const user = await prismaClient.user.create({
      data: {
        email: email,
        password: passwordHash,
        role: "PROFESSIONAL",
      },
    });

    const professional = await prismaClient.professional.create({
      data: {
        id: user.id,
        userId: user.id,
        ...data,
      },
    });

    const token = sign(
      {
        email: user.email,
        role: user.role,
      },
      authConfig.jwt.secret,
      {
        subject: user.id,
        expiresIn: "365d",
      }
    );

    return {
      role: user.role,
      email: user.email,
      token: token,
      ...professional,
    };
  }
}

export { CreateProfessionalService };
