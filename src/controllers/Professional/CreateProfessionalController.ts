import { Request, Response } from 'express';
import { CreateProfessionalService } from '../../services/Professional/CreateProfessionalService';

class CreateProfessionalController {
    async handle(req: Request, res: Response) {
        const { name, email, phoneNumber, password, birthday, cref, cpf, description } = req.body
        
        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        const createProfessionalService = new CreateProfessionalService

        const professional = await createProfessionalService.execute({
            name, email, password, phoneNumber, birthday, photo, cref, cpf, description
        })

        if (professional["photo"]) {
            professional["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + professional["photo"];
        }

        return res.json(professional)
    }
}

export { CreateProfessionalController }