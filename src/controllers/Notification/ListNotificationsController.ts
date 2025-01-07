import { Request, Response } from "express";
import { ListNotificationsService } from "../../services/Notification/ListNotificationsService";

class ListNotificationsController {
  async handle(req: Request, res: Response) {
    const listNotificationsService = new ListNotificationsService();

    const userId = req.userId;

    const notifications = await listNotificationsService.execute({
      userId,
    });

    return res.json(notifications);
  }
}

export { ListNotificationsController };
