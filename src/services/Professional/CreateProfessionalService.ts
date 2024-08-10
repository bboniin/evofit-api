import { hash } from 'bcryptjs';
import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';
import { sign } from 'jsonwebtoken'
import authConfig from "../../utils/auth"

interface ProfessionalRequest {
    name: string;
    photo: string;
    phoneNumber: string;
    email: string;
    cpf: string;
    birthday: Date;
    password: string;
    cref: string;
    description: string;
}

class CreateProfessionalService {
    async execute({ name, password, birthday, phoneNumber, cpf, cref, photo, email, description }: ProfessionalRequest) {

        if (!name || !phoneNumber || !password || !cpf || !cref || !email || !birthday) {
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
            cref: cref,
            description: description,
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
                role: "PROFESSIONAL"
            }
        })

        const professional = await prismaClient.professional.create({
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
            ...professional
        })
    }
}

export { CreateProfessionalService }