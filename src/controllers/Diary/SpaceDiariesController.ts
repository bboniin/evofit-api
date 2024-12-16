import { Request, Response } from 'express';
import { SpaceDiariesService } from '../../services/Diary/SpaceDiariesService';

class SpaceDiariesController {
    async handle(req: Request, res: Response) {
        
        const spaceId = req.userId

        const spaceDiariesService = new SpaceDiariesService

        const order = await spaceDiariesService.execute({
            spaceId: spaceId
        })

        return res.json(order)
    }
}

export { SpaceDiariesController }