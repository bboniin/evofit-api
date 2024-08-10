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
                photos: true
            }
        })

        return (professional)
    }
}

export { GetProfessionalService }