import prismaClient from '../../prisma'

interface ScheduleRequest {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    userId: string;
}

class EditScheduleProfessionalService {
    async execute({dayOfWeek, startTime, endTime, userId }: ScheduleRequest) {

        if (!dayOfWeek || !startTime || !endTime || !userId) {
            throw new Error("Todos os campos são obrigatórios")
        }

        const scheduleAlreadyExists = await prismaClient.workSchedule.findFirst({
            where: {
                professionalId: userId,
                dayOfWeek: dayOfWeek-1
            }
        })

        if(dayOfWeek > 7 || dayOfWeek < 1){
            throw new Error("Dia da semana é inválido")
        }

        if(scheduleAlreadyExists){
            const schedule = await prismaClient.workSchedule.update({
                where: {
                    id: scheduleAlreadyExists.id
                },
                data: {
                    startTime: startTime,
                    endTime: endTime
                }
            })

            return schedule
        }else{
            const schedule = await prismaClient.workSchedule.create({
                data: {
                    professionalId: userId,
                    dayOfWeek: dayOfWeek-1,
                    startTime: startTime,
                    endTime: endTime
                }
            })

            return schedule
        }
    }
}

export { EditScheduleProfessionalService }