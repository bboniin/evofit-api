import prismaClient from '../../prisma'

interface ChatRequest {
    userId: string;
    recipientId: string;
    content: string;
    userType: string;
}

class SendMessageService {
    async execute({ userId, recipientId, userType, content}: ChatRequest) {

        let chat = await prismaClient.chat.findFirst({
            where: userType == "CLIENT" ? 
                {
                    clientId: userId,
                    professionalId: recipientId
                } :
                {
                    clientId: recipientId,
                    professionalId: userId
                }
        })

        if(!chat){
            chat = await prismaClient.chat.create({
                data: {
                    clientId: userType == "CLIENT" ? userId : recipientId,
                    professionalId: userType == "CLIENT" ? recipientId : userId
                }
            })
        }

        const message = await prismaClient.message.create({
            data: {
                chatId: chat.id,
                userId: userId,
                content: content
            },
            include: {
                chat: {
                    include: {
                        client: true,
                        professional: true
                    }
                },
            }
        })
        
        return(message)
    }
}

export { SendMessageService }