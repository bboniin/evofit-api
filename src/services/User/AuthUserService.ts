import prismaClient from '../../prisma'
import { sign } from 'jsonwebtoken'
import authConfig from "../../utils/auth"
import { compare } from 'bcryptjs';

interface AuthRequest {
    email: string;
    password: string;
}

class AuthUserService {
    async execute({ email, password }: AuthRequest) {

        if (!password || !email) {
            throw new Error("Email e Senha são obrigatórios")
        }

        const user = await prismaClient.user.findFirst({
            where: {
                email: email
            },
            include: {
                space: true,
                client: true,
                professional: true
            }
        })

        if (!user) {
            throw new Error("Email e Senha não correspondem ou não existe")
        }

        const passwordMatch = await compare(password, user.password)

        if (!passwordMatch) {
            throw new Error("Email e Senha não correspondem ou não existe")
        }

        const token = sign({
            email: user.email,
            role: user.role
        }, authConfig.jwt.secret, {
            subject: user.id,
            expiresIn: '365d'
        })

        switch(user.role){
            case "SPACE": {
                return ({
                    role: user.role,
                    email: user.email,
                    token: token,
                    ...user.space
                })
            }
            case "CLIENT": {
                return ({
                    role: user.role,
                    email: user.email,
                    token: token,
                    ...user.client
                })
            }
            case "PROFESSIONAL": {
                return ({
                    role: user.role,
                    email: user.email,
                    token: token,
                    ...user.professional
                })
            }
        }
    }
}

export { AuthUserService }