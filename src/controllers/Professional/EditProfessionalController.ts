import { Request, Response } from 'express';
import { EditProfessionalService } from '../../services/Professional/EditProfessionalService';

class EditProfessionalController {
    async handle(req: Request, res: Response) {
        const { name, birthday, phoneNumber, email, cref, description, valueConsultancy, enableConsultancy,
            descriptionConsultancy, valueLesson, enableLesson, keyPix, descriptionLesson, cpf } = req.body

        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        let userId = req.userId

        const editProfessionalService = new EditProfessionalService

        const professional = await editProfessionalService.execute({
            name, birthday, phoneNumber, email, cref, description, valueConsultancy, enableConsultancy,
            descriptionConsultancy, valueLesson, enableLesson, keyPix, descriptionLesson, photo, cpf, userId
        })

        if (professional["photo"]) {
            professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + professional["photo"];
        }

        return res.json(professional)
    }
}

export { EditProfessionalController }