import { Request, Response } from 'express';
import { CreatePaymentService } from '../../services/Payment/CreatePaymentService';

class CreatePaymentController {
    async handle(req: Request, res: Response) {
        
        const createPaymentService = new CreatePaymentService

        const data = await createPaymentService.execute({
            data: req.body
        })

        return res.json(data)
    }
}

export { CreatePaymentController }