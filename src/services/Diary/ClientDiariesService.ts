import prismaClient from '../../prisma';

interface OrderDiaryRequest {
    clientId: string;
}

class ClientDiariesService {
    async execute({ clientId }: OrderDiaryRequest) {


        const client = await prismaClient.client.findUnique({
            where: { 
                userId: clientId
             }
        });

        if (!client) {
            throw new Error('Cliente não encontrado');
        }

        const spaces = await prismaClient.space.findMany({
            where: {
                diaries: {
                    some: {
                        clientId: clientId,
                        status: {
                          not: "cancelado",
                        }
                    },
                }
            },
            include: {
                diaries: {
                    where: {
                        clientId: clientId,
                        status: {
                          not: "cancelado"
                        }
                    },
                    orderBy: {
                        status: "desc"
                    }
                }
            }
        });

        return spaces;
    }
}

export { ClientDiariesService };
