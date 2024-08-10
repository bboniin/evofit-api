import { Request, Response } from 'express';
import { PhotoAddProfessionalService } from '../../services/Professional/PhotoAddProfessionalService';

class PhotoAddProfessionalController {
    async handle(req: Request, res: Response) {

        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        let userId = req.userId

        const photoAddProfessionalService = new PhotoAddProfessionalService

        const photoProfessional = await photoAddProfessionalService.execute({
            userId, photo
        })

        if (photoProfessional["photo"]) {
            photoProfessional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoProfessional["photo"];
        }

        return res.json(photoProfessional)
    }
}

export { PhotoAddProfessionalController }