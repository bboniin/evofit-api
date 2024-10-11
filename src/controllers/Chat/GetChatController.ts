import { Request, Response } from 'express';
import { GetChatService } from '../../services/Chat/GetChatService';

class GetChatController {
    async handle(req: Request, res: Response) {
        
        const userId = req.userId
        const { recipientId } = req.params
        
        const getChatService = new GetChatService

        const messages = await getChatService.execute({
            userId, recipientId
        })

        return res.json(messages)
    }
}

export { GetChatController }