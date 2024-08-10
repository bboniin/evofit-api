import { Request, Response } from 'express';
import { CreateClientService } from '../../services/Client/CreateClientService';

class CreateClientController {
    async handle(req: Request, res: Response) {
        const { name, password, birthday, phoneNumber, cpf, objective, experienceLevel, email } = req.body
        
        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        const createClientService = new CreateClientService

        const client = await createClientService.execute({
            name, password, birthday, phoneNumber, cpf, objective, experienceLevel, photo, email
        })

        if (client["photo"]) {
            client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + client["photo"];
        }

        return res.json(client)
    }
}

export { CreateClientController }