import prismaClient from "../../prisma";
import { compare } from "bcryptjs";

interface DeleteRequest {
  password: string;
  userId: string;
}

class DeleteUserService {
  async execute({ password, userId }: DeleteRequest) {
    if (!password) {
      throw new Error("Email é obrigatório");
    }

    const user = await prismaClient.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        space: true,
        client: true,
        professional: true,
      },
    });

    if (!user) {
      throw new Error("Usuário não foi encontrado");
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Senha está incorreta");
    }

    await prismaClient.user.delete({
      where: {
        id: userId,
      },
    });

    switch (user.role) {
      case "CLIENT": {
        await prismaClient.client.update({
          where: {
            id: user.id,
          },
          data: {
            isDeleted: true,
          },
        });
        await prismaClient.clientsProfessional.updateMany({
          where: {
            clientId: user.id,
          },
          data: {
            status: "cancelled",
          },
        });
      }
      case "PROFESSIONAL": {
        await prismaClient.professional.update({
          where: {
            id: user.id,
          },
          data: {
            isDeleted: true,
          },
        });
        await prismaClient.clientsProfessional.updateMany({
          where: {
            professionalId: user.id,
          },
          data: {
            status: "cancelled",
          },
        });
      }
      case "SPACE": {
        await prismaClient.space.update({
          where: {
            id: user.id,
          },
          data: {
            isDeleted: true,
          },
        });
      }
    }
  }
}

export { DeleteUserService };
