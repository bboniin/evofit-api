import { Request, Response } from 'express';
import { DeleteClientProfessionalService } from '../../services/ClientProfessional/DeleteClientProfessionalService';

class DeleteClientProfessionalController {
    async handle(req: Request, res: Response) {
        
        const { clientId } = req.params

        const userId = req.userId

        const deleteClientProfessionalService = new DeleteClientProfessionalService

        const clientProfessional = await deleteClientProfessionalService.execute({
            clientId, professionalId: userId
        })

        return res.json(clientProfessional)
    }
}


export { DeleteClientProfessionalController }