import { Request, Response } from "express";
import { GetClientProfessionalService } from "../../services/ClientProfessional/GetClientProfessionalService";

class GetClientProfessionalController {
  async handle(req: Request, res: Response) {
    const { clientId } = req.params;

    const userId = req.userId;

    const getClientProfessionalService = new GetClientProfessionalService();

    const clientProfessional = await getClientProfessionalService.execute({
      clientId,
      userId,
    });
    if (clientProfessional.client?.photo) {
      clientProfessional.client["photo_url"] =
        "https://evofit-data.s3.us-east-1.amazonaws.com/" +
        clientProfessional.client.photo;
    }

    return res.json(clientProfessional);
  }
}

export { GetClientProfessionalController };
