import { Request, Response } from 'express';
import { DayWeekScheduleProfessionalService } from '../../services/Schedule/DayWeekScheduleProfessionalService';

class DayWeekScheduleProfessionalController {
    async handle(req: Request, res: Response) {
        
        const { dayWeek } = req.params
        const { clientId, isBlock } = req.query
        
        const  userId = req.userId

        const dayWeekScheduleProfessionalService = new DayWeekScheduleProfessionalService

        const schedule = await dayWeekScheduleProfessionalService.execute({
            dayWeek: dayWeek ? Number(dayWeek) : -1, userId, isBlock: isBlock == "true", clientId: clientId ? String(clientId) : ""
        })

        return res.json(schedule)
    }
}

export { DayWeekScheduleProfessionalController }