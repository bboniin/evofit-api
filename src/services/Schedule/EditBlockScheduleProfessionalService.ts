import prismaClient from "../../prisma";

interface ScheduleRequest {
  blockId: string;
  startTime: string;
  endTime: string;
  professionalId: string;
  description: string;
}

class EditBlockScheduleProfessionalService {
  async execute({
    professionalId,
    blockId,
    startTime,
    endTime,
    description,
  }: ScheduleRequest) {
    const blockGet = await prismaClient.schedule.findUnique({
      where: {
        id: blockId,
        professionalId: professionalId,
        isBlock: true,
      },
    });

    if (!blockGet) {
      throw new Error("Trava não encontrada");
    }

    const block = await prismaClient.schedule.update({
      where: {
        id: blockId,
      },
      data: {
        startTime: startTime,
        endTime: endTime,
        description: description,
      },
    });
    return block;
  }
}

export { EditBlockScheduleProfessionalService };
