import { Request, Response } from 'express';
import { ListLinkedSpacesService } from '../../services/Professional/ListLinkedSpacesService';

class ListLinkedSpacesController {
    async handle(req: Request, res: Response) {
        
        let userId = req.userId
        
        const listLinkedSpacesService = new ListLinkedSpacesService

        const spaces = await listLinkedSpacesService.execute({
            userId
        })

        spaces.map((item)=>{
            if (item.space["photo"]) {
                item.space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.space["photo"];
            }
        })

        return res.json(spaces)
    }
}

export { ListLinkedSpacesController }