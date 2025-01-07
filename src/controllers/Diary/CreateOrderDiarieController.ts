import { Request, Response } from 'express';
import { CreateOrderDiaryService } from '../../services/Diary/CreateOrderDiaryService';

class CreateOrderDiaryController {
    async handle(req: Request, res: Response) {
        
        const { spaceId } = req.params

        const { amount } = req.body

        const userId = req.userId

        const createOrderDiaryService = new CreateOrderDiaryService

        const order = await createOrderDiaryService.execute({
            clientId: userId, spaceId, amount
        })

        return res.json(order)
    }
}

export { CreateOrderDiaryController }