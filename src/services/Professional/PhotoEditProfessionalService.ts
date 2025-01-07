import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface ProfessionalRequest {
    id: string;
    photo: string;
}

class PhotoEditProfessionalService {
    async execute({ photo, id }: ProfessionalRequest) {

        if (!photo) {
            throw new Error("Envie uma imagem para adicionar ao seu perfil")
        }

        const photoExist = await prismaClient.photosProfessional.findUnique({
            where: {
                id: id,
            }
        })

        if (!photoExist) {
            throw new Error("Imagem não encontrada")
        }

        const s3Storage = new S3Storage()

        await s3Storage.deleteFile(photoExist.photo)

        const photoSave = await s3Storage.saveFile(photo)

        const photoProfessional = await prismaClient.photosProfessional.update({
            where: {
                id: id
            },
            data: {
                photo: photoSave
            },
        })

        return (photoProfessional)
    }
}

export { PhotoEditProfessionalService }