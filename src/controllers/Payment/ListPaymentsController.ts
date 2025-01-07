import { Request, Response } from 'express';
import { ListPaymentsService } from '../../services/Payment/ListPaymentsService';

class ListPaymentsController {
    async handle(req: Request, res: Response) {
    
        const listPaymentsService = new ListPaymentsService

        const { month, all } = req.query

        const userId = req.userId

        const payments = await listPaymentsService.execute({
            userId, month: Number(month) || 0, all: all == "true"
        })

        payments.map((item)=>{
            if (item.client?.photo) {
                item.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.client.photo;
            }
        })

        return res.json(payments)
    }
}

export { ListPaymentsController }