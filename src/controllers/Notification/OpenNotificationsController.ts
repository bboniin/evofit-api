import { Request, Response } from "express";
import { OpenNotificationsService } from "../../services/Notification/OpenNotificationsService";

class OpenNotificationsController {
  async handle(req: Request, res: Response) {
    const openNotificationsService = new OpenNotificationsService();

    const userId = req.userId;

    const notifications = await openNotificationsService.execute({
      userId,
    });

    return res.json(notifications);
  }
}

export { OpenNotificationsController };
