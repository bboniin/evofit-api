import { Request, Response } from 'express';
import { PhotoRemoveSpaceService } from '../../services/Space/PhotoRemoveSpaceService';

class PhotoRemoveSpaceController {
    async handle(req: Request, res: Response) {

        const { photoId } = req.params

        let userId = req.userId

        const photoRemoveSpaceService = new PhotoRemoveSpaceService

        const photoSpace = await photoRemoveSpaceService.execute({
            photoId, userId
        })

        if (photoSpace["photo"]) {
            photoSpace["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoSpace["photo"];
        }

        return res.json(photoSpace)
    }
}

export { PhotoRemoveSpaceController }