import prismaClient from '../../prisma'

interface ClientRequest {
    id: string;
}

class GetClientProfessionalService {
    async execute({ id }: ClientRequest) {

        const client = await prismaClient.clientsProfessional.findUnique({
            where: {
                id: id
            },
            include: {
                client: true,
                schedules: {
                    orderBy: {
                        dayOfWeek: "asc"
                    }
                }
            }
        })

        return (client)
    }
}

export { GetClientProfessionalService }