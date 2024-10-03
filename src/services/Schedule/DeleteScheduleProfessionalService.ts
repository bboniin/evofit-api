import prismaClient from '../../prisma'

interface ClientRequest {
    scheduleId: string;
}

class DeleteScheduleProfessionalService {
    async execute({ scheduleId }: ClientRequest) {

        const scheduleAlreadyExists = await prismaClient.workSchedule.findFirst({
            where: {
                id: scheduleId
            }
        })

        if(!scheduleAlreadyExists){
            throw new Error("Horário de trabalho não encontrado")
        }

        await prismaClient.workSchedule.delete({
            where: {
                id: scheduleId
            },
        })

        await prismaClient.schedule.deleteMany({
            where: {
                professionalId: scheduleAlreadyExists.professionalId,
                dayOfWeek: scheduleAlreadyExists.dayOfWeek,
                isBlock: true
            },
        })

        return "Deletado com sucesso"
    }
}

export { DeleteScheduleProfessionalService }