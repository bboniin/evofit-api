import { Request, Response } from 'express';
import { ListClientsProfessionalService } from '../../services/ClientProfessional/ListClientsProfessionalService';

class ListClientsProfessionalController {
    async handle(req: Request, res: Response) {

        const userId = req.userId

        const listClientsProfessionalService = new ListClientsProfessionalService

        const clientsProfessional = await listClientsProfessionalService.execute({
            userId
        })

        clientsProfessional.map((item)=>{
            if (item.client?.photo) {
                item.client["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.client.photo;
            }
        })

        return res.json(clientsProfessional)
    }
}

export { ListClientsProfessionalController }