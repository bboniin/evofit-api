import { Request, Response } from 'express';
import { GetClientProfessionalService } from '../../services/ClientProfessional/GetClientProfessionalService';

class GetClientProfessionalController {
    async handle(req: Request, res: Response) {

        const { id } = req.params

        const getClientProfessionalService = new GetClientProfessionalService

        const clientProfessional = await getClientProfessionalService.execute({
            id
        })
        if (clientProfessional.client?.photo) {
            clientProfessional.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + clientProfessional.client.photo;
        }

        return res.json(clientProfessional)
    }
}

export { GetClientProfessionalController }