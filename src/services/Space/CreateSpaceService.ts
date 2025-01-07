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

interface SpaceRequest {
  name: string;
  photo: string;
  phoneNumber: string;
  email: string;
  cpfOrCnpj: string;
  typeUser: string;
  latitude: number;
  longitude: number;
  password: string;
  description: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  address: string;
  number: string;
  complement: string;
}

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
    email,
  }: SpaceRequest) {
    if (
      !name ||
      !phoneNumber ||
      !password ||
      !typeUser ||
      !cpfOrCnpj ||
      !neighborhood ||
      !email ||
      !city ||
      !state ||
      !zipCode ||
      !longitude ||
      !latitude ||
      !address ||
      !number
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
      phoneNumber: phoneNumber,
      cpfOrCnpj: cpfOrCnpj,
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
      complement: complement,
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
        role: "SPACE",
      },
    });

    const space = await prismaClient.space.create({
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
      ...space,
    };
  }
}

export { CreateSpaceService };
