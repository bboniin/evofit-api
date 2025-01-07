import { Request, Response } from 'express';
import { CreateClientProfessionalService } from '../../services/ClientProfessional/CreateClientProfessionalService';

class CreateClientProfessionalController {
    async handle(req: Request, res: Response) {
        
        const { name, phoneNumber, email, academy, value, dayDue, consultancy, schedule } = req.body

        const userId = req.userId

        const createClientProfessionalService = new CreateClientProfessionalService

        const clientProfessional = await createClientProfessionalService.execute({
            name, professionalId: userId, phoneNumber, email, academy, consultancy, value, dayDue, schedule
        })

        return res.json(clientProfessional)
    }
}

export { CreateClientProfessionalController }