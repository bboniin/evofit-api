import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface ClientRequest {
    name: string;
    photo: string;
    phoneNumber: string;
    email: string;
    cpf: string;
    birthday: Date;
    userId: string;
    objective: string;
    experienceLevel: string;
}

class EditClientService {
    async execute({ name, birthday, phoneNumber, cpf, objective, experienceLevel, photo, email, userId }: ClientRequest) {

        let data = {}

        const user = await prismaClient.user.findUnique({
            where: {
                id: userId,
                role: "CLIENT"
            },
            include: {
                client: true
            }
        })

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        const userData = {
            email: user.email,
            ...user.client
        }
 
        if (email) {
            const userAlreadyExists = await prismaClient.user.findFirst({
                where: {
                    email: email
                }
            })

            if (userAlreadyExists) {
                if (userAlreadyExists.id != userId) {
                    throw new Error("Email já cadastrado")
                }
            }
        }

        data = {
            name: name || userData.name,
            birthday: birthday ? new Date(birthday) : userData.birthday,
            phoneNumber: phoneNumber || userData.phoneNumber,
            objective: objective || userData.objective,
            experienceLevel: experienceLevel || userData.experienceLevel,
            cpf: cpf || userData.cpf,
        }


        if (photo) {
            const s3Storage = new S3Storage()

            const upload = await s3Storage.saveFile(photo)

            data["photo"] = upload

            if (userData.photo) {
                await s3Storage.deleteFile(userData.photo)
            }
        }

        const userEdit = await prismaClient.client.update({
            where: {
                userId: userId,
            },
            data: data,
        })

        if(email && (email != userData.email)){
            await prismaClient.user.update({
                where: {
                    id: userId,
                },
                data: {
                    email: email
                },
            })
        }

        return ({
            role: user.role,
            email: email || user.email,
            ...userEdit
        })
    }
}

export { EditClientService }