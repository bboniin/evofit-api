import prismaClient from '../../prisma'

interface SpaceRequest {
    spaceId: string;
}

class GetSpaceService {
    async execute({ spaceId }: SpaceRequest) {

        const space = await prismaClient.space.findUnique({
            where: {
                id: spaceId
            },
            include: {
                photos: true,
                professionals: {
                    where: {
                        professional: {
                            finishBank: true,
                            finishProfile: true
                        }
                    },
                    include: {
                        professional: true
                    }
                }
            }
        })

        return (space)
    }
}

export { GetSpaceService }