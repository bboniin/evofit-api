import { Request, Response } from 'express';
import { ListScheduleProfessionalService } from '../../services/Schedule/ListScheduleProfessionalService';

class ListScheduleProfessionalController {
    async handle(req: Request, res: Response) {
        
        const userId = req.userId

        const listScheduleProfessionalService = new ListScheduleProfessionalService

        const schedule = await listScheduleProfessionalService.execute({
            userId
        })

        return res.json(schedule)
    }
}

export { ListScheduleProfessionalController }