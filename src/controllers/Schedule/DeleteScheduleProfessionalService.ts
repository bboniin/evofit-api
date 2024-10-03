import { Request, Response } from 'express';
import { DeleteScheduleProfessionalService } from '../../services/Schedule/DeleteScheduleProfessionalService';

class DeleteScheduleProfessionalController {
    async handle(req: Request, res: Response) {
        
        const { scheduleId } = req.params

        const deleteScheduleProfessionalService = new DeleteScheduleProfessionalService

        const schedule = await deleteScheduleProfessionalService.execute({
            scheduleId
        })

        return res.json(schedule)
    }
}

export { DeleteScheduleProfessionalController }