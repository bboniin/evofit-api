import { Request, Response } from "express";
import { GetBalanceService } from "../../services/Recipient/GetBalanceService";

class GetBalanceController {
  async handle(req: Request, res: Response) {
    const getBalanceService = new GetBalanceService();

    const userId = req.userId;

    const balance = await getBalanceService.execute({
      userId,
    });

    balance.payments.map((item) => {
      if (item.client?.photo) {
        item.client["photo_url"] =
          "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.client.photo;
      }
    });

    return res.json(balance);
  }
}

export { GetBalanceController };
