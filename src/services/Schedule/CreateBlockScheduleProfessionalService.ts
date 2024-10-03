import prismaClient from '../../prisma';

interface ScheduleRequest {
    professionalId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string
}

class CreateBlockScheduleProfessionalService {
    async execute({ professionalId, dayOfWeek, startTime, endTime}: ScheduleRequest) {

        const block = await prismaClient.schedule.create({
            data: {
                professionalId: professionalId,
                dayOfWeek: dayOfWeek,
                startTime: startTime,
                endTime: endTime,
                recurring: true,
                isBlock: true,
                date: new Date()
            }
        })
        return (block)
    }
}

export { CreateBlockScheduleProfessionalService };
