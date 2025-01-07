import { Request, Response } from 'express';
import { PhotoListProfessionalService } from '../../services/Professional/PhotoListProfessionalService';

class PhotoListProfessionalController {
    async handle(req: Request, res: Response) {
        
        let userId = req.userId

        const photoListProfessionalService = new PhotoListProfessionalService

        const photosProfessional = await photoListProfessionalService.execute({
            userId
        })

        photosProfessional.map((item)=>{
            if (item["photo"]) {
                item["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
            }
        })
        
        return res.json(photosProfessional)
    }
}

export { PhotoListProfessionalController }