import { Request, Response } from 'express';
import { GetWithdrawalsService } from '../../services/Recipient/GetWithdrawalsService';

class GetWithdrawalsController {
    async handle(req: Request, res: Response) {
        
        const getWithdrawalsService = new GetWithdrawalsService

        const userId = req.userId

        const recipient = await getWithdrawalsService.execute({
            userId
        })

        return res.json(recipient)
    }
}

export { GetWithdrawalsController }