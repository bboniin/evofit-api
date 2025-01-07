import prismaClient from '../../prisma'

interface ProfessionalRequest {
    id: string;
    userId: string;
}

class RemoveLinkedSpaceService {
    async execute({ id, userId }: ProfessionalRequest) {

        const professionalSpace = await prismaClient.professionalSpace.findUnique({
            where: {
                id: id,
                professionalId: userId
            }
        })

        if (!professionalSpace) {
            throw new Error("Vinculação não encontrada")
        }

        await prismaClient.professionalSpace.delete({
            where: {
                id: id
            }
        })

        return ("Vinculação deletada com sucesso")
    }
}

export { RemoveLinkedSpaceService }