import prismaClient from "../../prisma";

interface SpaceRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  userId: string;
}

class CreateSpaceHourService {
  async execute({ dayOfWeek, startTime, endTime, userId }: SpaceRequest) {
    if (!startTime || !endTime) {
      throw new Error("Horário de inicio e fim são obrigatórios");
    }
    await prismaClient.spaceHours.create({
      data: {
        spaceId: userId,
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime,
      },
    });
  }
}

export { CreateSpaceHourService };
