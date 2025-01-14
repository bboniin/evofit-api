import prismaClient from "../../prisma";

interface DiaryRequest {
  diaryId: string;
}

class UsedDiaryService {
  async execute({ diaryId }: DiaryRequest) {
    const diary = await prismaClient.diary.findUnique({
      where: {
        id: diaryId,
      },
    });

    if (!diary) {
      throw new Error("Diária não encontrada");
    }

    if (diary.used) {
      throw new Error("Diária já foi utilizada");
    }

    const order = await prismaClient.diary.update({
      where: {
        id: diaryId,
      },
      data: {
        used: true,
        dateUsed: new Date(),
      },
    });

    return order;
  }
}

export { UsedDiaryService };
