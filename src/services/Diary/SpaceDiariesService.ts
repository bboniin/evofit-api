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
                        status: "confirmado",
                        used: false
                    },
                }
            },
        });

        return clients;
    }
}

export { SpaceDiariesService };
