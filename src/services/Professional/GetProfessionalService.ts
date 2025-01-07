import prismaClient from '../../prisma'

interface ProfessionalRequest {
    professionalId: string;
}

class GetProfessionalService {
    async execute({ professionalId }: ProfessionalRequest) {

        const professional = await prismaClient.professional.findUnique({
            where: {
                userId: professionalId
            },
            include: {
                photos: true,
                clientsProfessional: {
                    where: {
                        clientId: {
                          not: null
                        }
                    },
                    include: {
                        client: true
                    }
                }
            }
        })

        professional["clientsTotal"] = professional.clientsProfessional.length
        professional.clientsProfessional = professional.clientsProfessional.slice(0, 4)

        return (professional)
    }
}

export { GetProfessionalService }