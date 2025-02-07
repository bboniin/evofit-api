import { Request, Response } from "express";
import { CreateClientProfessionalService } from "../../services/ClientProfessional/CreateClientProfessionalService";

class CreateClientProfessionalController {
  async handle(req: Request, res: Response) {
    const {
      name,
      phoneNumber,
      email,
      spaceId,
      value,
      dateNextPayment,
      consultancy,
      schedule,
      billingPeriod,
    } = req.body;

    const userId = req.userId;

    const createClientProfessionalService =
      new CreateClientProfessionalService();

    const clientProfessional = await createClientProfessionalService.execute({
      name,
      professionalId: userId,
      phoneNumber,
      email,
      spaceId,
      consultancy,
      value,
      dateNextPayment,
      schedule,
      billingPeriod,
    });

    return res.json(clientProfessional);
  }
}

export { CreateClientProfessionalController };
