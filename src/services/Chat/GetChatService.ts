import prismaClient from '../../prisma'

interface ChatRequest {
    userId: string;
    recipientId: string;
}

class GetChatService {
    async execute({ userId, recipientId }: ChatRequest) {

        const chat = await prismaClient.chat.findFirst({
            where: {
                OR: [
                    {
                        clientId: userId,
                        professionalId: recipientId
                    },
                    {
                        clientId: recipientId,
                        professionalId: userId
                    } 
                ]
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        })

        if(chat){
            return (chat.messages)
        }else{
            return []
        }
        
    }
}

export { GetChatService }