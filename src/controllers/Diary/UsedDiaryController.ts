import { Request, Response } from 'express';
import { UsedDiaryService } from '../../services/Diary/UsedDiaryService';

class UsedDiaryController {
    async handle(req: Request, res: Response) {
        
        const { diaryId } = req.params

        const usedDiaryService = new UsedDiaryService

        const order = await usedDiaryService.execute({
            diaryId: diaryId
        })

        return res.json(order)
    }
}

export { UsedDiaryController }