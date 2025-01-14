import prismaClient from "../../prisma";

interface DiaryRequest {
  userId: string;
}

class SpaceHistoricDiariesService {
  async execute({ userId }: DiaryRequest) {
    const diaries = await prismaClient.diary.findMany({
      where: {
        spaceId: userId,
        used: true,
      },
      include: {
        client: true,
      },
    });

    return diaries;
  }
}

export { SpaceHistoricDiariesService };
