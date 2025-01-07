import { Request, Response } from 'express';
import { PhotoListSpaceService } from '../../services/Space/PhotoListSpaceService';

class PhotoListSpaceController {
    async handle(req: Request, res: Response) {

        let userId = req.userId

        const photoListSpaceService = new PhotoListSpaceService

        const photosSpace = await photoListSpaceService.execute({
            userId
        })
        
        photosSpace.map((item)=>{
            if (item["photo"]) {
                item["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
            }
        })

        return res.json(photosSpace)
    }
}

export { PhotoListSpaceController }