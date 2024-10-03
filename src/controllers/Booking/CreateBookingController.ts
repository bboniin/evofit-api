import { Request, Response } from 'express';
import { CreateBookingService } from '../../services/Booking/CreateBookingService';

class CreateBookingController {
    async handle(req: Request, res: Response) {
        
        const { professionalId, date, startTime, endTime } = req.body

        const userId = req.userId

        const createBookingService = new CreateBookingService

        const booking = await createBookingService.execute({
            clientId: userId, professionalId, date, startTime, endTime
        })

        return res.json(booking)
    }
}

export { CreateBookingController }