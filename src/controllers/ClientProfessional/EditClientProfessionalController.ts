import { Request, Response } from "express";
import { EditClientProfessionalService } from "../../services/ClientProfessional/EditClientProfessionalService";

class EditClientProfessionalController {
  async handle(req: Request, res: Response) {
    const {
      name,
      spaceId,
      value,
      dayDue,
      schedule,
      email,
      consultancy,
      billingPeriod,
    } = req.body;

    const { clientId } = req.params;

    const userId = req.userId;

    const editClientProfessionalService = new EditClientProfessionalService();

    const clientProfessional = await editClientProfessionalService.execute({
      clientId,
      name,
      spaceId,
      value,
      dayDue,
      schedule,
      professionalId: userId,
      email,
      consultancy,
      billingPeriod,
    });

    return res.json(clientProfessional);
  }
}

export { EditClientProfessionalController };
