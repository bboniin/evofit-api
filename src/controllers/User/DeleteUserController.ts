import { Request, Response } from 'express';
import { DeleteUserService } from '../../services/User/DeleteUserService';

class DeleteUserController {
    async handle(req: Request, res: Response) {

        const { password } = req.body

        const userId = req.userId

        const deleteUserService = new DeleteUserService

        const user = await deleteUserService.execute({
            userId, password
        })

        return res.json(user)
    }
}

export { DeleteUserController }