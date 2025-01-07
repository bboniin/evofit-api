import { Request, Response } from 'express';
import { ClientPaymentsService } from '../../services/Payment/ClientPaymentsService';

class ClientPaymentsController {
    async handle(req: Request, res: Response) {
    
        const clientPaymentsService = new ClientPaymentsService

        const userId = req.userId

        const payments = await clientPaymentsService.execute({
            userId
        })

        payments.map((item)=>{
            if (item.space?.photo) {
                item.space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.space.photo;
            }
            if (item.professional?.photo) {
                item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional.photo;
            }
        })

        return res.json(payments)
    }
}

export { ClientPaymentsController }