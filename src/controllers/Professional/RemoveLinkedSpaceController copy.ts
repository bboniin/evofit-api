import { Request, Response } from 'express';
import { RemoveLinkedSpaceService } from '../../services/Professional/RemoveLinkedSpaceService';

class RemoveLinkedSpaceController {
    async handle(req: Request, res: Response) {
        
        const { id } = req.params

        let userId = req.userId
        
        const removeLinkedSpaceService = new RemoveLinkedSpaceService

        const user = await removeLinkedSpaceService.execute({
            id, userId
        })

        return res.json(user)
    }
}

export { RemoveLinkedSpaceController }