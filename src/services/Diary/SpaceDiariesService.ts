import prismaClient from '../../prisma';

interface OrderDiaryRequest {
    spaceId: string;
}

class SpaceDiariesService {
    async execute({ spaceId }: OrderDiaryRequest) {

        const space = await prismaClient.space.findUnique({
            where: { 
                userId: spaceId
             }
        });

        if (!space) {
            throw new Error('Espaço não encontrado');
        }

        const clients = await prismaClient.client.findMany({
            where: {
                diaries: {
                    some: {
                        spaceId: space.id,
                        status: {
                          not: "cancelled"
                        }
                    },
                }
            },
            include: {
                diaries: {
                    where: {
                        status: {
                            not: "cancelled"
                        }
                    },
                    orderBy: {
                        status: "desc"
                    }
                }
            }
        });

        return clients;
    }
}

export { SpaceDiariesService };
