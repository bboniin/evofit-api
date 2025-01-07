import { Request, Response } from 'express';
import { CreateRecipientService } from '../../services/Recipient/CreateRecipientService';

class CreateRecipientController {
    async handle(req: Request, res: Response) {
        
        const { bank, branch, account, type } = req.body

        const createRecipientService = new CreateRecipientService

        const userId = req.userId

        const recipient = await createRecipientService.execute({
            bank, branch, account, type, userId
        })

        return res.json(recipient)
    }
}

export { CreateRecipientController }