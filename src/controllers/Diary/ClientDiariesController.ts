import { Request, Response } from 'express';
import { ClientDiariesService } from '../../services/Diary/ClientDiariesService';

class ClientDiariesController {
    async handle(req: Request, res: Response) {
        
        const clientId = req.userId

        const clientDiariesService = new ClientDiariesService

        const spaces = await clientDiariesService.execute({
            clientId: clientId
        })

        spaces.map((data)=>{
            if (data["photo"]) {
                data["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + data["photo"];
            }
        })

        return res.json(spaces)
    }
}

export { ClientDiariesController }