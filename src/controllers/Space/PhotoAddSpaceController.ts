import { Request, Response } from 'express';
import { PhotoAddSpaceService } from '../../services/Space/PhotoAddSpaceService';

class PhotoAddSpaceController {
    async handle(req: Request, res: Response) {
        
        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        let userId = req.userId

        const photoAddSpaceService = new PhotoAddSpaceService

        const photoSpace = await photoAddSpaceService.execute({
            userId, photo
        })

        if (photoSpace["photo"]) {
            photoSpace["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoSpace["photo"];
        }

        return res.json(photoSpace)
    }
}

export { PhotoAddSpaceController }