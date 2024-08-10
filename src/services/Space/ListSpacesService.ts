import prismaClient from '../../prisma'

interface SpaceRequest {
    minLatitude: number;
    minLongitude: number;
    maxLatitude: number;
    maxLongitude: number;
}

class ListSpacesService {
    async execute({ minLatitude, minLongitude, maxLatitude, maxLongitude }: SpaceRequest) {

        const spaces = await prismaClient.space.findMany({
            where: {
                latitude: {
                  gte: minLatitude,
                  lte: maxLatitude
                },
                longitude: {
                  gte: minLongitude,
                  lte: maxLongitude
                }
            },
            include: {
                photos: true,
                professionals: {
                    include: {
                        professional: true
                    }
                }
            }
        })

        return (spaces)
    }
}

export { ListSpacesService }