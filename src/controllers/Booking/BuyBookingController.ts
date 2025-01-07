import { Request, Response } from "express";
import { BuyBookingService } from "../../services/Booking/BuyBookingService";

class BuyBookingController {
  async handle(req: Request, res: Response) {
    const { professionalId, date, startTime, endTime } = req.body;

    const userId = req.userId;

    const buyBookingService = new BuyBookingService();

    const booking = await buyBookingService.execute({
      clientId: userId,
      professionalId,
      date,
      startTime,
      endTime,
    });

    return res.json(booking);
  }
}

export { BuyBookingController };
