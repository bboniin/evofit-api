import { Request, Response } from 'express';
import { PhotoEditProfessionalService } from '../../services/Professional/PhotoEditProfessionalService';

class PhotoEditProfessionalController {
    async handle(req: Request, res: Response) {
        
        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        let { id } = req.params

        const photoEditProfessionalService = new PhotoEditProfessionalService

        const photoProfessional = await photoEditProfessionalService.execute({
            id, photo
        })

        if (photoProfessional["photo"]) {
            photoProfessional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoProfessional["photo"];
        }

        return res.json(photoProfessional)
    }
}

export { PhotoEditProfessionalController }