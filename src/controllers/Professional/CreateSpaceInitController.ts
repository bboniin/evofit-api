import { Request, Response } from 'express';
import { CreateSpaceInitService } from '../../services/Professional/CreateSpaceInitService';

class CreateSpaceInitController {
    async handle(req: Request, res: Response) {
        const { name, latitude, longitude, description } = req.body
        
        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        const createSpaceInitService = new CreateSpaceInitService

        const space = await createSpaceInitService.execute({
            name, latitude: Number(latitude), longitude: Number(longitude), photo, description
        })

        if (space["photo"]) {
            space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + space["photo"];
        }

        return res.json(space)
    }
}

export { CreateSpaceInitController }