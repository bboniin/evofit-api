import { Request, Response } from "express";
import { SpaceHistoricDiariesService } from "../../services/Diary/SpaceHistoricDiariesService";

class SpaceHistoricDiariesController {
  async handle(req: Request, res: Response) {
    const userId = req.userId;

    const spaceHistoricDiariesService = new SpaceHistoricDiariesService();

    const diaries = await spaceHistoricDiariesService.execute({
      userId: userId,
    });

    diaries.map((data) => {
      if (data.client["photo"]) {
        data.client["photo_url"] =
          "https://evofit-data.s3.us-east-1.amazonaws.com/" +
          data.client["photo"];
      }
    });

    return res.json(diaries);
  }
}

export { SpaceHistoricDiariesController };
