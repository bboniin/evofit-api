import { Request, Response } from "express";
import { ListSpacesService } from "../../services/Space/ListSpacesService";

class ListSpacesController {
  async handle(req: Request, res: Response) {
    const { minLatitude, minLongitude, maxLatitude, maxLongitude } = req.query;

    const listSpacesService = new ListSpacesService();

    const spaces = await listSpacesService.execute({
      minLatitude: Number(minLatitude),
      minLongitude: Number(minLongitude),
      maxLatitude: Number(maxLatitude),
      maxLongitude: Number(maxLongitude),
    });

    spaces.map((item) => {
      if (item["photo"]) {
        item["photo_url"] =
          "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
      }
      item.professionals.map((data) => {
        if (data.professional["photo"]) {
          data.professional["photo_url"] =
            "https://evofit-data.s3.us-east-1.amazonaws.com/" +
            data.professional["photo"];
        }
      });
    });

    return res.json(spaces);
  }
}

export { ListSpacesController };
