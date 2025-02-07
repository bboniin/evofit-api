import { Request, Response } from "express";
import { GetStatusPaymentsService } from "../../services/Payment/GetStatusPaymentsService";

class GetStatusPaymentsController {
  async handle(req: Request, res: Response) {
    const getStatusPaymentsService = new GetStatusPaymentsService();

    const userId = req.userId;

    const status = await getStatusPaymentsService.execute({
      userId,
    });

    return res.json(status);
  }
}

export { GetStatusPaymentsController };
