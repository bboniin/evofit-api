import prismaClient from "../../prisma";
import { isAfter, addHours } from "date-fns";

interface BodyRequest {
  code: string;
  email: string;
}

class PasswordVerifyResetService {
  async execute({ code, email }: BodyRequest) {
    const passwordCode = await prismaClient.passwordForgot.findFirst({
      where: {
        code: code,
        email: email,
      },
    });

    if (!passwordCode) {
      throw new Error("Código inválido");
    }

    if (passwordCode.used) {
      throw new Error("Código já foi utilizado");
    }

    const dateCreated = passwordCode.createdAt;
    const dateLimit = addHours(dateCreated, 2);

    const isCodeExpired = isAfter(new Date(), dateLimit);

    if (isCodeExpired) {
      throw new Error("Código expirado");
    }

    const user = await prismaClient.user.findFirst({
      where: {
        email: passwordCode.email,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return passwordCode;
  }
}

export { PasswordVerifyResetService };
