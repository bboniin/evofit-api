import { Request, Response } from 'express';
import { FrequencyBookingService } from '../../services/Booking/FrequencyBookingService';

class FrequencyBookingController {
    async handle(req: Request, res: Response) {
        
        const userId = req.userId

        const frequencyBookingService = new FrequencyBookingService

        const frequency = await frequencyBookingService.execute({
            userId
        })

        frequency.map((item)=>{
            if (item.professional["photo"]) {
                item.professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.professional["photo"];
            }
        })

        return res.json(frequency)
    }
}

export { FrequencyBookingController }