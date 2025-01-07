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
                            OR: [
                                { recipientStatus: "registration" },
                                { recipientStatus: "affiliation" },
                                { recipientStatus: "active" },
                            ],
                            finishProfile: true
                        }
                    },
                    include: {
                        professional: true
                    }
                },
                spaceHours: true
            }
        })

        return (space)
    }
}

export { GetSpaceService }