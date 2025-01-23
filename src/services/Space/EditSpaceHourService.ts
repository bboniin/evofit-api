import prismaClient from "../../prisma";

interface SpaceRequest {
  id: string;
  startTime: string;
  endTime: string;
}

class EditSpaceHourService {
  async execute({ startTime, endTime, id }: SpaceRequest) {
    if (!startTime || !endTime) {
      throw new Error("Horário de inicio e fim são obrigatórios");
    }

    await prismaClient.spaceHours.update({
      where: {
        id: id,
      },
      data: {
        startTime: startTime,
        endTime: endTime,
      },
    });
  }
}

export { EditSpaceHourService };
