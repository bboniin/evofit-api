import prismaClient from '../../prisma'

interface SpaceRequest {
    userId: string;
}

class PhotoListSpaceService {
    async execute({ userId }: SpaceRequest) {

        const photos = await prismaClient.photosSpace.findMany({
            where: {
                userId: userId
            }
        })

        return (photos)
    }
}

export { PhotoListSpaceService }