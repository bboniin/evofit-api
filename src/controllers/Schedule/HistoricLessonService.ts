import { Request, Response } from "express";
import { HistoricLessonService } from "../../services/Schedule/HistoricLessonService";

class HistoricLessonController {
  async handle(req: Request, res: Response) {
    const userId = req.userId;

    const historicLessonService = new HistoricLessonService();

    const bookings = await historicLessonService.execute({
      userId: userId,
    });

    bookings.map((item) => {
      if (item["professional"]["photo"]) {
        item["professional"]["photo_url"] =
          "https://evofit-data.s3.us-east-1.amazonaws.com/" +
          item["professional"]["photo"];
      }
    });

    return res.json(bookings);
  }
}

export { HistoricLessonController };
