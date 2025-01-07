import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface SpaceRequest {
    id: string;
    photo: string;
}

class PhotoEditSpaceService {
    async execute({ photo, id }: SpaceRequest) {

        if (!photo) {
            throw new Error("Envie uma imagem para adicionar ao seu perfil")
        }

        const photoExist = await prismaClient.photosSpace.findUnique({
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

        const photoSpace = await prismaClient.photosSpace.update({
            where: {
                id: id
            },
            data: {
                photo: photoSave
            },
        })

        return (photoSpace)
    }
}

export { PhotoEditSpaceService }