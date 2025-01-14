import { Request, Response } from "express";
import { ClientHistoricDiariesService } from "../../services/Diary/ClientHistoricDiariesService";

class ClientHistoricDiariesController {
  async handle(req: Request, res: Response) {
    const userId = req.userId;

    const clientHistoricDiariesService = new ClientHistoricDiariesService();

    const diaries = await clientHistoricDiariesService.execute({
      userId: userId,
    });

    diaries.map((data) => {
      if (data.space["photo"]) {
        data.space["photo_url"] =
          "https://evofit-data.s3.us-east-1.amazonaws.com/" +
          data.space["photo"];
      }
    });

    return res.json(diaries);
  }
}

export { ClientHistoricDiariesController };
