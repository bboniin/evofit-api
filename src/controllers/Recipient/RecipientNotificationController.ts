import { Request, Response } from 'express';
import { RecipientNotificationService } from '../../services/Recipient/RecipientNotificationService';

class RecipientNotificationController {
    async handle(req: Request, res: Response) {
        
        const recipientNotificationService = new RecipientNotificationService

        const data = await recipientNotificationService.execute({
            data: req.body
        })

        return res.json(data)
    }
}

export { RecipientNotificationController }