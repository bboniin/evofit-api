import { Request, Response } from "express";
import { CreateRecipientService } from "../../services/Recipient/CreateRecipientService";

class CreateRecipientController {
  async handle(req: Request, res: Response) {
    const {
      bank,
      branch,
      account,
      type,
      company_name,
      trading_name,
      name,
      cpf,
      birthday,
      address,
      neighborhood,
      number,
      zipCode,
      complement,
      state,
      city,
    } = req.body;

    const createRecipientService = new CreateRecipientService();

    const userId = req.userId;

    const recipient = await createRecipientService.execute({
      bank,
      branch,
      account,
      type,
      company_name,
      trading_name,
      name,
      cpf,
      birthday,
      address,
      neighborhood,
      number,
      zipCode,
      complement,
      state,
      city,
      userId,
    });

    return res.json(recipient);
  }
}

export { CreateRecipientController };
