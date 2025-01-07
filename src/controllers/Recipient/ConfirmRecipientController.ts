import { Request, Response } from 'express';
import { ConfirmRecipientService } from '../../services/Recipient/ConfirmRecipientService';

class ConfirmRecipientController {
    async handle(req: Request, res: Response) {
        
        const { recipientId } = req.params

        const confirmRecipientService = new ConfirmRecipientService

        const userId = req.userId

        const recipient = await confirmRecipientService.execute({
            recipientId, userId
        })

        return res.json(recipient)
    }
}

export { ConfirmRecipientController }