import { Request, Response } from 'express';
import { BlocksScheduleProfessionalService } from '../../services/Schedule/BlocksScheduleProfessionalService';

class BlocksScheduleProfessionalController {
    async handle(req: Request, res: Response) {
        
        const userId = req.userId

        const blocksScheduleProfessionalService = new BlocksScheduleProfessionalService

        const schedule = await blocksScheduleProfessionalService.execute({
            professionalId: userId
        })

        return res.json(schedule)
    }
}

export { BlocksScheduleProfessionalController }