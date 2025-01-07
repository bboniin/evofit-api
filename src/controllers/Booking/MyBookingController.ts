import { Request, Response } from 'express';
import { MyBookingService } from '../../services/Booking/MyBookingService';

class MyBookingController {
    async handle(req: Request, res: Response) {
        
        const userId = req.userId

        const myBookingService = new MyBookingService

        const scheduleBooking = await myBookingService.execute({
            userId
        })

        scheduleBooking.schedules.map((item)=>{
            if (item.professional["photo"]) {
                item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional["photo"];
            }
        })

        scheduleBooking.bookings.map((item)=>{
            if (item.professional["photo"]) {
                item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional["photo"];
            }
        })

        return res.json(scheduleBooking)
    }
}

export { MyBookingController }