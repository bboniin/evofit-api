import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface ProfessionalRequest {
    photoId: string;
    userId: string;
}

class PhotoRemoveProfessionalService {
    async execute({ photoId, userId }: ProfessionalRequest) {

        const photo = await prismaClient.photosProfessional.findUnique({
            where: {
                id: photoId,
                userId: userId
            }
        })

        if (!photo) {
            throw new Error("Imagem não encontrada")
        }

        const s3Storage = new S3Storage()

        await s3Storage.deleteFile(photo.photo)

        await prismaClient.photosProfessional.delete({
            where: {
                id: photoId,
            },
        })

        return ("Imagem deletada com sucesso")
    }
}

export { PhotoRemoveProfessionalService }