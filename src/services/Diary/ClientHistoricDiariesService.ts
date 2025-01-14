import prismaClient from "../../prisma";

interface DiaryRequest {
  userId: string;
}

class ClientHistoricDiariesService {
  async execute({ userId }: DiaryRequest) {
    const diaries = await prismaClient.diary.findMany({
      where: {
        clientId: userId,
        used: true,
      },
      include: {
        space: true,
      },
    });

    return diaries;
  }
}

export { ClientHistoricDiariesService };
