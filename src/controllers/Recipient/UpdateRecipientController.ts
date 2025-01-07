import { Request, Response } from 'express';
import { UpdateRecipientService } from '../../services/Recipient/UpdateRecipientService';

class UpdateRecipientController {
    async handle(req: Request, res: Response) {
        
        const { bank, branch, account, type } = req.body

        const updateRecipientService = new UpdateRecipientService

        const userId = req.userId

        const recipient = await updateRecipientService.execute({
            bank, branch, account, type, userId
        })

        return res.json(recipient)
    }
}

export { UpdateRecipientController }