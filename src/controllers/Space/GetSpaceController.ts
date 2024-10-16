import { Request, Response } from 'express';
import { GetSpaceService } from '../../services/Space/GetSpaceService';

class GetSpaceController {
    async handle(req: Request, res: Response) {

        const { spaceId } = req.params

        const getSpaceService = new GetSpaceService

        const space = await getSpaceService.execute({
            spaceId
        })

        if (space["photo"]) {
            space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + space["photo"];
        }

        space.photos.map((item)=>{
            if (item["photo"]) {
                item["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
            }
        })

        space.professionals.map((item)=>{
            if (item["professional"]["photo"]) {
                item["professional"]["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["professional"]["photo"];
            }
        })

        return res.json(space)
    }
}

export { GetSpaceController }