import { Request, Response } from 'express';
import { EditSpaceService } from '../../services/Space/EditSpaceService';

class EditSpaceController {
    async handle(req: Request, res: Response) {
        const { name, city, state, enableDiarie, descriptionDiarie, valueDiarie, zipCode, address, number, complement, phoneNumber, 
            latitude, longitude, description, email, schedule, type } = req.body

        let photo = ""

        if (req.file) {
            photo = req.file.filename
        }

        let userId = req.userId

        const editSpaceService = new EditSpaceService

        const space = await editSpaceService.execute({
            name, city, state, descriptionDiarie, valueDiarie: valueDiarie ? Number(valueDiarie) : 0, enableDiarie: enableDiarie == "true", zipCode, address, number, complement, phoneNumber,
            latitude: latitude ? Number(latitude) : 0, longitude: longitude ? Number(longitude) : 0, description, photo, email, schedule, type, userId
        })

        if (space["photo"]) {
            space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + space["photo"];
        }

        return res.json(space)
    }
}

export { EditSpaceController }