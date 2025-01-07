import { Request, Response } from 'express';
import { CreateWithdrawalService } from '../../services/Recipient/CreateWithdrawalService';

class CreateWithdrawalController {
    async handle(req: Request, res: Response) {
        
        const { value } = req.body

        const createWithdrawalService = new CreateWithdrawalService

        const userId = req.userId

        const recipient = await createWithdrawalService.execute({
            value, userId
        })

        return res.json(recipient)
    }
}

export { CreateWithdrawalController }