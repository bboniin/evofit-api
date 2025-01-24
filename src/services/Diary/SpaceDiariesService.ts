import prismaClient from "../../prisma";

interface DiaryRequest {
  spaceId: string;
}

class SpaceDiariesService {
  async execute({ spaceId }: DiaryRequest) {
    const space = await prismaClient.space.findUnique({
      where: {
        id: spaceId,
        isDeleted: false,
      },
    });

    if (!space) {
      throw new Error("Espaço não encontrado");
    }

    const clients = await prismaClient.client.findMany({
      where: {
        diaries: {
          some: {
            spaceId: space.id,
            used: false,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      include: {
        diaries: {
          where: {
            used: false,
          },
        },
      },
    });

    return clients;
  }
}

export { SpaceDiariesService };
