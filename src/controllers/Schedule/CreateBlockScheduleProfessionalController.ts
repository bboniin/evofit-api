import { Request, Response } from 'express';
import { CreateBlockScheduleProfessionalService } from '../../services/Schedule/CreateBlockScheduleProfessionalService';

class CreateBlockScheduleProfessionalController {
    async handle(req: Request, res: Response) {
        
        const { startTime, endTime, dayOfWeek } = req.body

        const userId = req.userId

        const createBlockScheduleProfessionalService = new CreateBlockScheduleProfessionalService

        const block = await createBlockScheduleProfessionalService.execute({
            professionalId: userId, startTime, endTime, dayOfWeek
        })

        return res.json(block)
    }
}

export { CreateBlockScheduleProfessionalController }