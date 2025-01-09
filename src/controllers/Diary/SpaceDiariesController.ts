import { Request, Response } from "express";
import { SpaceDiariesService } from "../../services/Diary/SpaceDiariesService";

class SpaceDiariesController {
  async handle(req: Request, res: Response) {
    const spaceId = req.userId;

    const spaceDiariesService = new SpaceDiariesService();

    const clients = await spaceDiariesService.execute({
      spaceId: spaceId,
    });

    clients.map((item) => {
      if (item["photo"]) {
        item["photo_url"] =
          "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
      }
    });

    return res.json(clients);
  }
}

export { SpaceDiariesController };
