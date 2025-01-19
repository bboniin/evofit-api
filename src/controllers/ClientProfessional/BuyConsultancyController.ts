import { Request, Response } from "express";
import { BuyConsultancyService } from "../../services/ClientProfessional/BuyConsultancyService";

class BuyConsultancyController {
  async handle(req: Request, res: Response) {
    const { professionalId } = req.body;

    const userId = req.userId;

    const buyConsultancyService = new BuyConsultancyService();

    const clientProfessional = await buyConsultancyService.execute({
      userId: userId,
      professionalId: professionalId,
    });

    return res.json(clientProfessional);
  }
}

export { BuyConsultancyController };
