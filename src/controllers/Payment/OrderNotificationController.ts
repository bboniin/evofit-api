import { Request, Response } from 'express';
import { OrderNotificationService } from '../../services/Payment/OrderNotificationService';

class OrderNotificationController {
    async handle(req: Request, res: Response) {
        
        const orderNotificationService = new OrderNotificationService

        const data = await orderNotificationService.execute({
            data: req.body
        })

        return res.json(data)
    }
}

export { OrderNotificationController }