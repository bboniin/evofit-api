import prismaClient from '../../prisma'

interface ScheduleRequest {
    userId: string;
}

class ListScheduleProfessionalService {
    async execute({ userId }: ScheduleRequest) {

        const schedule = await prismaClient.workSchedule.findMany({
            where: {
                professionalId: userId
            },
            orderBy: {
                dayOfWeek: "asc"
            }
        })

        return (schedule)
    }
}

export { ListScheduleProfessionalService }