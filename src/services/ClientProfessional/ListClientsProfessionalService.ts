import prismaClient from '../../prisma'

interface ClientRequest {
    userId: string;
}

class ListClientsProfessionalService {
    async execute({ userId }: ClientRequest) {

        const clients = await prismaClient.clientsProfessional.findMany({
            where: {
                professionalId: userId,
            },
            include: {
                client: true
            }
        })

        return (clients)
    }
}

export { ListClientsProfessionalService }