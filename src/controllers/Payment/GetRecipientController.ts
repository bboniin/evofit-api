import { Request, Response } from 'express';
import { GetRecipientService } from '../../services/Payment/GetRecipientService';

class GetRecipientController {
    async handle(req: Request, res: Response) {
        
        const { recipientId } = req.params

        const getRecipientService = new GetRecipientService

        const userId = req.userId

        const recipient = await getRecipientService.execute({
            recipientId, userId
        })

        return res.json(recipient)
    }
}

export { GetRecipientController }