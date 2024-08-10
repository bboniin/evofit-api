import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface SpaceRequest {
    photoId: string;
    userId: string;
}

class PhotoRemoveSpaceService {
    async execute({ photoId, userId }: SpaceRequest) {

        const photo = await prismaClient.photosSpace.findUnique({
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

        await prismaClient.photosSpace.delete({
            where: {
                id: photoId,
            },
        })

        return ("Imagem deletada com sucesso")
    }
}

export { PhotoRemoveSpaceService }