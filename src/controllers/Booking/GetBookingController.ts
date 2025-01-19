import { Request, Response } from "express";
import { GetBookingService } from "../../services/Booking/GetBookingService";

class GetBookingController {
  async handle(req: Request, res: Response) {
    const { bookingId } = req.params;

    const getBookingService = new GetBookingService();

    const bookig = await getBookingService.execute({
      bookingId,
    });

    if (bookig.professional["photo"]) {
      bookig.professional["photo_url"] =
        "https://evofit-data.s3.us-east-1.amazonaws.com/" +
        bookig.professional["photo"];
    }
    if (bookig.client["photo"]) {
      bookig.client["photo_url"] =
        "https://evofit-data.s3.us-east-1.amazonaws.com/" +
        bookig.client["photo"];
    }
    if (bookig.space["photo"]) {
      bookig.space["photo_url"] =
        "https://evofit-data.s3.us-east-1.amazonaws.com/" +
        bookig.space["photo"];
    }

    return res.json(bookig);
  }
}

export { GetBookingController };
