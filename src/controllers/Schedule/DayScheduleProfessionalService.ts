import { Request, Response } from "express";
import { DayScheduleProfessionalService } from "../../services/Schedule/DayScheduleProfessionalService";

class DayScheduleProfessionalController {
  async handle(req: Request, res: Response) {
    const { professionalId } = req.params;

    const { date, user } = req.query;

    const dayScheduleProfessionalService = new DayScheduleProfessionalService();

    const schedule = await dayScheduleProfessionalService.execute({
      date: new Date(String(date)),
      professionalId,
      user: user == "true",
    });

    return res.json(schedule);
  }
}

export { DayScheduleProfessionalController };
