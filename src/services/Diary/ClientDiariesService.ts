import prismaClient from "../../prisma";

interface DiaryRequest {
  clientId: string;
}

class ClientDiariesService {
  async execute({ clientId }: DiaryRequest) {
    const client = await prismaClient.client.findUnique({
      where: {
        userId: clientId,
        isDeleted: false,
      },
    });

    if (!client) {
      throw new Error("Cliente não encontrado");
    }

    const spaces = await prismaClient.space.findMany({
      where: {
        diaries: {
          some: {
            clientId: clientId,
            used: false,
          },
        },
      },
      include: {
        diaries: {
          where: {
            clientId: clientId,
            used: false,
          },
        },
      },
    });

    return spaces;
  }
}

export { ClientDiariesService };
