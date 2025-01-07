import { Request, Response } from 'express';
import { EditScheduleProfessionalService } from '../../services/Schedule/EditScheduleProfessionalService';

class EditScheduleProfessionalController {
    async handle(req: Request, res: Response) {

        const { dayOfWeek, startTime, endTime } = req.body

        const userId = req.userId

        const editScheduleProfessionalService = new EditScheduleProfessionalService

        const scheduleEdit = await editScheduleProfessionalService.execute({
            dayOfWeek, startTime, endTime, userId
        })

        return res.json(scheduleEdit)
    }
}

export { EditScheduleProfessionalController }