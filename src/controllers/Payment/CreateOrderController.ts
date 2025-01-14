import { Request, Response } from "express";
import { CreateOrderService } from "../../services/Payment/CreateOrderService";

class CreateOrderController {
  async handle(req: Request, res: Response) {
    const {
      amount,
      spaceId,
      buyDiarie,
      professionalId,
      date,
      startTime,
      endTime,
    } = req.body;

    const userId = req.userId;

    const createOrderService = new CreateOrderService();

    const order = await createOrderService.execute({
      clientId: userId,
      spaceId,
      amount,
      professionalId,
      date,
      startTime,
      endTime,
      buyDiarie,
    });

    return res.json(order);
  }
}

export { CreateOrderController };
