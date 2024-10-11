import { Request, Response } from 'express';
import { ListChatsService } from '../../services/Chat/ListChatsService';

class ListChatsController {
    async handle(req: Request, res: Response) {
        
        const userId = req.userId

        const listChatsService = new ListChatsService

        const chats = await listChatsService.execute({
            userId
        })

        chats.map((item)=>{
            if (item.client?.photo) {
                item.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.client.photo;
            }
            if (item.professional?.photo) {
                item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional.photo;
            }
        })

        return res.json(chats)
    }
}

export { ListChatsController }