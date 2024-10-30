import prismaClient from '../../prisma'
import { isAfter, addHours } from 'date-fns';
import { hash } from "bcryptjs"

interface BodyRequest {
    id: string;
    password: string;
}

class PasswordResetService {
    async execute({ id, password }: BodyRequest) {


        const passwordCode = await prismaClient.passwordForgot.findUnique({
            where: {
                id: id,
            },
        });

        if (!passwordCode) {
            throw new Error('Código inválido');
        }

        if (passwordCode.used) {
            throw new Error('Código já foi utilizado');
        }

        const user = await prismaClient.user.findUnique({
            where: {
                email: passwordCode.email
            }
        })

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const hashedPassword = await hash(password, 8);

        await prismaClient.user.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword
            }
        })

        await prismaClient.passwordForgot.update({
            where: {
                id: id
            },
            data: {
                used: true
            },
        });

        return ({ message: "Senha alterada com sucesso" })
    }
}

export { PasswordResetService }