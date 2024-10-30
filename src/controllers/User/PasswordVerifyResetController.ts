import { Request, Response } from 'express';
import { PasswordVerifyResetService } from '../../services/User/PasswordVerifyResetService';

class PasswordVerifyResetController {
    async handle(req: Request, res: Response) {
        const { code } = req.params

        const { email } = req.body

        const passwordVerifyResetService = new PasswordVerifyResetService

        const passwordForgot = await passwordVerifyResetService.execute({
            code, email
        })

        return res.json(passwordForgot)
    }
}

export { PasswordVerifyResetController }