import { hash } from 'bcryptjs';
import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';
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
    async execute({ name, password, birthday, phoneNumber, cpf, objective, experienceLevel, photo, email }: ClientRequest) {

        if (!name || !phoneNumber || !password || !cpf || !objective || !experienceLevel || !email || !birthday) {
            throw new Error("Todos os campos são obrigatórios")
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

        if (photo) {
            const s3Storage = new S3Storage()

            const upload = await s3Storage.saveFile(photo)

            data["photo"] = upload
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
                userId: user.id,
                ...data
            }
        })


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