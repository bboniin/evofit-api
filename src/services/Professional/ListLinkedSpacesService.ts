import prismaClient from '../../prisma'

interface ProfessionalRequest {
    userId: string;
}

class ListLinkedSpacesService {
    async execute({ userId }: ProfessionalRequest) {

        const spacesLinks = await prismaClient.professionalSpace.findMany({
            where: {
                professionalId: userId
            },
            include: {
                space: {
                    include: {
                        spaceHours: true
                    }
                }
            }
        })

        return (spacesLinks)
    }
}

export { ListLinkedSpacesService }