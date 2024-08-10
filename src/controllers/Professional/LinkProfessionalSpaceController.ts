import { Request, Response } from 'express';
import { LinkProfessionalSpaceService } from '../../services/Professional/LinkProfessionalSpaceService';

class LinkProfessionalSpaceController {
    async handle(req: Request, res: Response) {

        const { spaceId } = req.params
        
        let userId = req.userId
        
        const linkProfessionalSpaceService = new LinkProfessionalSpaceService

        const user = await linkProfessionalSpaceService.execute({
            userId, spaceId
        })

        return res.json(user)
    }
}

export { LinkProfessionalSpaceController }