import { Request, Response } from 'express';
import { ConfirmPaymentService } from '../../services/Payment/ConfirmPaymentService';

class ConfirmPaymentController {
    async handle(req: Request, res: Response) {
        
        const confirmPaymentService = new ConfirmPaymentService

        const data = await confirmPaymentService.execute({
            data: req.body
        })

        return res.json(data)
    }
}

export { ConfirmPaymentController }