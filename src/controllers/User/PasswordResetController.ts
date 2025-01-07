import { Request, Response } from 'express';
import { PasswordResetService } from '../../services/User/PasswordResetService';

class PasswordResetController {
    async handle(req: Request, res: Response) {
        const { id } = req.params
        const { password } = req.body

        const passwordResetService = new PasswordResetService

        const passwordForgot = await passwordResetService.execute({
            id, password
        })

        return res.json(passwordForgot)
    }
}

export { PasswordResetController }