import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface ProfessionalRequest {
    id: string;
    userId: string;
}

class PhotoRemoveProfessionalService {
    async execute({ id, userId }: ProfessionalRequest) {

        const photo = await prismaClient.photosProfessional.findUnique({
            where: {
                id: id,
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
                id: id,
            },
        })

        return ("Imagem deletada com sucesso")
    }
}

export { PhotoRemoveProfessionalService }