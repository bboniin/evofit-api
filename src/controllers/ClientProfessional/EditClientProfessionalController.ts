import { Request, Response } from "express";
import { EditClientProfessionalService } from "../../services/ClientProfessional/EditClientProfessionalService";

class EditClientProfessionalController {
  async handle(req: Request, res: Response) {
    const { name, spaceId, value, dayDue, schedule } = req.body;

    const { clientId } = req.params;

    const editClientProfessionalService = new EditClientProfessionalService();

    const clientProfessional = await editClientProfessionalService.execute({
      clientId,
      name,
      spaceId,
      value,
      dayDue,
      schedule,
    });

    return res.json(clientProfessional);
  }
}

export { EditClientProfessionalController };
