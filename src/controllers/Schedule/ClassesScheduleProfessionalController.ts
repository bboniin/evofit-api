import { Request, Response } from 'express';
import { ClassesScheduleProfessionalService } from '../../services/Schedule/ClassesScheduleProfessionalService';

class ClassesScheduleProfessionalController {
    async handle(req: Request, res: Response) {
        
        const userId = req.userId

        const { date } = req.query

        const classesScheduleProfessionalService = new ClassesScheduleProfessionalService

        const schedules = await classesScheduleProfessionalService.execute({
            date: new Date(String(date)), professionalId: userId
        })

        schedules.map((item)=>{
            if (item["client"]["photo"]) {
                item["client"]["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["client"]["photo"];
            }
        })
        return res.json(schedules)
    }
}

export { ClassesScheduleProfessionalController }