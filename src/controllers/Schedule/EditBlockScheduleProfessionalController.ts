import { Request, Response } from 'express';
import { EditBlockScheduleProfessionalService } from '../../services/Schedule/EditBlockScheduleProfessionalService';

class EditBlockScheduleProfessionalController {
    async handle(req: Request, res: Response) {
        
        const { startTime, endTime } = req.body

        const { blockId } = req.params

        const userId = req.userId

        const editBlockScheduleProfessionalService = new EditBlockScheduleProfessionalService

        const block = await editBlockScheduleProfessionalService.execute({
            professionalId: userId, startTime, endTime, blockId
        })

        return res.json(block)
    }
}

export { EditBlockScheduleProfessionalController }