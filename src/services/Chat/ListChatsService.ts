import prismaClient from '../../prisma'

interface ChatRequest {
    userId: string;
}

class ListChatsService {
    async execute({ userId}: ChatRequest) {

        const chats = await prismaClient.chat.findMany({
            where: {
                OR: [{
                        clientId: userId
                    }, {
                        professionalId: userId
                    }
                ]
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                client: true,
                professional: true
            }
        })
        
        return(chats)
    }
}

export { ListChatsService }