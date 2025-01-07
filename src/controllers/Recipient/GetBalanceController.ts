import { Request, Response } from 'express';
import { GetBalanceService } from '../../services/Recipient/GetBalanceService';

class GetBalanceController {
    async handle(req: Request, res: Response) {
        

        const getBalanceService = new GetBalanceService

        const userId = req.userId

        const balance = await getBalanceService.execute({
            userId
        })

        return res.json(balance)
    }
}

export { GetBalanceController }