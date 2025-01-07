import prismaClient from '../../prisma'

interface ProfessionalRequest {
    userId: string;
}

class PhotoListProfessionalService {
    async execute({ userId }: ProfessionalRequest) {

        const photos = await prismaClient.photosProfessional.findMany({
            where: {
                userId: userId
            }
        })

        return (photos)
    }
}

export { PhotoListProfessionalService }