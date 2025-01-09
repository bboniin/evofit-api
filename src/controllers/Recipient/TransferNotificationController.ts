import { Request, Response } from "express";
import { TransferNotificationService } from "../../services/Recipient/TransferNotificationService";

class TransferNotificationController {
  async handle(req: Request, res: Response) {
    const transferNotificationService = new TransferNotificationService();

    const data = await transferNotificationService.execute({
      data: req.body,
    });

    return res.json(data);
  }
}

export { TransferNotificationController };
