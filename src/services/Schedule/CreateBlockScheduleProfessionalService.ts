import prismaClient from "../../prisma";

interface ScheduleRequest {
  professionalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  date: Date;
  recurring: boolean;
  description: string;
}

class CreateBlockScheduleProfessionalService {
  async execute({
    professionalId,
    dayOfWeek,
    startTime,
    endTime,
    recurring,
    date,
    description,
  }: ScheduleRequest) {
    const block = await prismaClient.schedule.create({
      data: {
        professionalId: professionalId,
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        recurring: recurring,
        isBlock: true,
        description: description,
        date: recurring ? new Date() : new Date(date),
      },
    });
    return block;
  }
}

export { CreateBlockScheduleProfessionalService };
