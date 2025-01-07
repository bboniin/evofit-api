import { Request, Response } from 'express';
import { PhotoRemoveProfessionalService } from '../../services/Professional/PhotoRemoveProfessionalService';

class PhotoRemoveProfessionalController {
    async handle(req: Request, res: Response) {

        const { id } = req.params

        let userId = req.userId

        const photoRemoveProfessionalService = new PhotoRemoveProfessionalService

        const photoProfessional = await photoRemoveProfessionalService.execute({
            id, userId
        })

        if (photoProfessional["photo"]) {
            photoProfessional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoProfessional["photo"];
        }

        return res.json(photoProfessional)
    }
}

export { PhotoRemoveProfessionalController }