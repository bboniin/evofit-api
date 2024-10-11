import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface ProfessionalRequest {
    photo: string;
    userId: string;
}

class PhotoAddProfessionalService {
    async execute({ photo, userId }: ProfessionalRequest) {

        if (!photo) {
            throw new Error("Envie uma imagem para adicionar ao seu perfil")
        }

        const s3Storage = new S3Storage()

        const photoSave = await s3Storage.saveFile(photo)

        const photoProfessional = await prismaClient.photosProfessional.create({
            data: {
                userId: userId,
                photo: photoSave
            },
        })

        return (photoProfessional)
    }
}

export { PhotoAddProfessionalService }