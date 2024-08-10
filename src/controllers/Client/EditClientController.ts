import { Request, Response } from 'express';
import { EditClientService } from '../../services/Client/EditClientService';

class EditClientController {
    async handle(req: Request, res: Response) {
        const { name, birthday, phoneNumber, cpf, objective, experienceLevel, email } = req.body

        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        let userId = req.userId

        const editClientService = new EditClientService

        const client = await editClientService.execute({
            name, birthday, phoneNumber, cpf, objective, experienceLevel, photo, email, userId
        })

        if (client["photo"]) {
            client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + client["photo"];
        }

        return res.json(client)
    }
}

export { EditClientController }