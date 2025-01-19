import { Request, Response } from "express";
import { RateBookingService } from "../../services/Booking/RateBookingService";

class RateBookingController {
  async handle(req: Request, res: Response) {
    const { bookingId } = req.params;

    const { status, rate, comment } = req.body;

    const rateBookingService = new RateBookingService();

    const rating = await rateBookingService.execute({
      bookingId,
      status,
      rate,
      comment,
    });

    return res.json(rating);
  }
}

export { RateBookingController };
