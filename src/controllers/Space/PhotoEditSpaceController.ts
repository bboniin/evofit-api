import { Request, Response } from 'express';
import { PhotoEditSpaceService } from '../../services/Space/PhotoEditSpaceService';

class PhotoEditSpaceController {
    async handle(req: Request, res: Response) {
        
        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        let { id } = req.params

        const photoEditSpaceService = new PhotoEditSpaceService

        const photoSpace = await photoEditSpaceService.execute({
            id, photo
        })

        if (photoSpace["photo"]) {
            photoSpace["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoSpace["photo"];
        }

        return res.json(photoSpace)
    }
}

export { PhotoEditSpaceController }