import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface SpaceRequest {
    photo: string;
    userId: string;
}

class PhotoAddSpaceService {
    async execute({ photo, userId }: SpaceRequest) {

        if (!photo) {
            throw new Error("Envie uma imagem para adicionar ao seu perfil")
        }

        const s3Storage = new S3Storage()

        const photoSave = await s3Storage.saveFile(photo)

        const photoSpace = await prismaClient.photosSpace.create({
            data: {
                userId: userId,
                photo: photoSave
            },
        })

        return (photoSpace)
    }
}

export { PhotoAddSpaceService }