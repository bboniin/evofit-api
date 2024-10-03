import { endOfDay, startOfDay } from 'date-fns';
import prismaClient from '../../prisma';

interface ScheduleRequest {
    professionalId: string;
}

class BlocksScheduleProfessionalService {
    async execute({ professionalId }: ScheduleRequest) {

        const blocks = await prismaClient.schedule.findMany({
            where: {
                professionalId,
                isBlock: true
            },
        });


        const blocksOrder = blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (blocksOrder)
    }
}

export { BlocksScheduleProfessionalService };
