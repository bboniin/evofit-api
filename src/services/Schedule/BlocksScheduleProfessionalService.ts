import { endOfDay, isBefore, startOfDay } from "date-fns";
import prismaClient from "../../prisma";

interface ScheduleRequest {
  professionalId: string;
}

class BlocksScheduleProfessionalService {
  async execute({ professionalId }: ScheduleRequest) {
    const blocks = await prismaClient.schedule.findMany({
      where: {
        professionalId,
        isBlock: true,
        recurring: false,
        date: {
          gte: startOfDay(new Date()),
        },
      },
    });

    const blocksRecurring = await prismaClient.schedule.findMany({
      where: {
        professionalId,
        isBlock: true,
        recurring: true,
      },
    });

    const blocksRecurringOrder = blocksRecurring.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const blocksOrder = blocks
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .sort((a, b) => {
        const dateA = new Date(a.date); // Converte para objeto Date
        const dateB = new Date(b.date);

        const dateComparison = dateA.getTime() - dateB.getTime(); // Subtrai os timestamps

        if (dateComparison === 0) {
          return a.startTime.localeCompare(b.startTime); // Ordena por startTime se as datas forem iguais
        }

        return dateComparison;
      });

    return { blocks: blocksOrder, blocksRecurring: blocksRecurringOrder };
  }
}

export { BlocksScheduleProfessionalService };
