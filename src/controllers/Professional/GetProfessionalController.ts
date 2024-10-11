import { Request, Response } from 'express';
import { GetProfessionalService } from '../../services/Professional/GetProfessionalService';

class GetProfessionalController {
    async handle(req: Request, res: Response) {

        const { professionalId } = req.params

        const getProfessionalService = new GetProfessionalService

        const professional = await getProfessionalService.execute({
            professionalId
        })

        if (professional["photo"]) {
            professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + professional["photo"];
        }

        professional.photos.map((item)=>{
            if (item["photo"]) {
                item["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
            }
        })

        professional.clientsProfessional.map((item)=>{
            if (item["client"]["photo"]) {
                item["client"]["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["client"]["photo"];
            }
        })

        return res.json(professional)
    }
}

export { GetProfessionalController }