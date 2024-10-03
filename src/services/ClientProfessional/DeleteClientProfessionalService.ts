import prismaClient from '../../prisma'

interface ClientRequest {
    clientId: string;
    professionalId: string;
}

class DeleteClientProfessionalService {
    async execute({ clientId, professionalId}: ClientRequest) {

        const clientAlreadyExists = await prismaClient.clientsProfessional.findFirst({
            where: {
                id: clientId
            }
        })

        if(!clientAlreadyExists){
            throw new Error("Cliente não encontrado")
        }

        await prismaClient.clientsProfessional.delete({
            where: {
                id: clientId
            },
        })

        const clientSchedule = await prismaClient.schedule.findFirst({
            where: {
                clientProfessionalId: clientId,
                professionalId: professionalId
            }
        })
        await prismaClient.schedule.delete({
            where: {
                id: clientSchedule.id
            },
        })

        return "Deletado com sucesso"
    }
}

export { DeleteClientProfessionalService }