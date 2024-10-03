import { hash } from 'bcryptjs';
import prismaClient from '../../prisma'
import { sign } from 'jsonwebtoken'
import authConfig from "../../utils/auth"

interface ClientRequest {
    name: string;
    photo: string;
    phoneNumber: string;
    email: string;
    cpf: string;
    birthday: Date;
    password: string;
    objective: string;
    experienceLevel: string;
}

class CreateClientService {
    async execute({ name, password, birthday, phoneNumber, cpf, objective, experienceLevel, email }: ClientRequest) {

        if (!name || !phoneNumber || !password || !cpf || !objective || !experienceLevel || !email || !birthday) {
            throw new Error("Preencha todos os campos obrigatórios")
        }

        const userAlreadyExists = await prismaClient.user.findFirst({
            where: {
                email: email
            }
        })

        if (userAlreadyExists) {
            throw new Error("Email já cadastrado")
        }

        const passwordHash = await hash(password, 8)

        let data = {
            name: name,
            birthday: new Date(birthday),
            phoneNumber: phoneNumber,
            cpf: cpf,
            objective: objective,
            experienceLevel: experienceLevel,
            photo: ""
        }

        const user = await prismaClient.user.create({
            data: {
                email: email,
                password: passwordHash,
                role: "CLIENT"
            }
        })

        const client = await prismaClient.client.create({
            data: {
                id: user.id,
                userId: user.id,
                ...data
            }
        })

        const clients = await prismaClient.clientsProfessional.findMany({
            where: {
                email: email,
                clientId: null
            }
        })

        await Promise.all(
            clients.map(async (item)=>{
                await prismaClient.clientsProfessional.update({
                    where: {
                        id: item.id
                    },
                    data: {
                        clientId: user.id
                    }
                })    
            })
        )

        const token = sign({
            email: user.email,
            role: user.role
        }, authConfig.jwt.secret, {
            subject: user.id,
            expiresIn: '365d'
        })

        return ({
            role: user.role,
            email: user.email,
            token: token,
            ...client
        })
    }
}

export { CreateClientService }