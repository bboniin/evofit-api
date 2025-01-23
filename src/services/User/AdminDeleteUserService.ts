import prismaClient from "../../prisma";
import { compare } from "bcryptjs";

interface DeleteRequest {
  userId: string;
  idDelete: string;
}

class AdminDeleteUserService {
  async execute({ userId, idDelete }: DeleteRequest) {
    const user = await prismaClient.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("Usuário não foi encontrado");
    }

    if (user.email != "huwelder@hotmail.com") {
      throw new Error("Usuário não é administrador");
    }

    const userDelete = await prismaClient.user.findFirst({
      where: {
        id: idDelete,
      },
    });

    if (userDelete) {
      await prismaClient.user.delete({
        where: {
          id: idDelete,
        },
      });
    }

    switch (userDelete.role) {
      case "CLIENT": {
        await prismaClient.client.update({
          where: {
            id: userDelete.id,
          },
          data: {
            isDeleted: true,
          },
        });
        await prismaClient.clientsProfessional.updateMany({
          where: {
            clientId: userDelete.id,
          },
          data: {
            status: "cancelled",
          },
        });
      }
      case "PROFESSIONAL": {
        await prismaClient.professional.update({
          where: {
            id: userDelete.id,
          },
          data: {
            isDeleted: true,
          },
        });
        await prismaClient.clientsProfessional.updateMany({
          where: {
            professionalId: userDelete.id,
          },
          data: {
            status: "cancelled",
          },
        });
      }
      default: {
        await prismaClient.space.update({
          where: {
            id: userDelete.id,
          },
          data: {
            isDeleted: true,
          },
        });
      }
    }
  }
}

export { AdminDeleteUserService };
