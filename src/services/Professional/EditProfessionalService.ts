import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface ProfessionalRequest {
    name,
    photo: string;
    phoneNumber: string;
    email: string;
    cpf: string;
    birthday: Date;
    cref: string;
    userId: string;
    description: string;
    valueConsultancy: number;
    enableConsultancy: boolean;
    descriptionConsultancy: string;
    valueLesson: number;
    enableLesson: boolean;
    descriptionLesson: string;
    keyPix: string;
}

class EditProfessionalService {
    async execute({ name, birthday, phoneNumber, photo, email, cref, description, valueConsultancy, userId,
        enableConsultancy, descriptionConsultancy, valueLesson, enableLesson, keyPix, descriptionLesson, cpf }: ProfessionalRequest) {

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
        

        const user = await prismaClient.user.findUnique({
            where: {
                id: userId,
                role: "PROFESSIONAL"
            },
            include: {
                professional: true
            }
        })

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        const userData = {
            email: user.email,
            ...user.professional
        }

        let data = {
            name: name || userData.name,
            birthday: birthday ? new Date(birthday) : userData.birthday,
            phoneNumber: phoneNumber || userData.phoneNumber,
            cref: cref || userData.cref,
            description: description || userData.description,
            valueConsultancy: valueConsultancy || userData.valueConsultancy,
            enableConsultancy: enableConsultancy || userData.enableConsultancy,
            descriptionConsultancy: descriptionConsultancy || userData.descriptionConsultancy,
            valueLesson: valueLesson || userData.valueLesson,
            enableLesson: enableLesson || userData.enableLesson,
            cpf: cpf || userData.cpf,
            descriptionLesson: descriptionLesson || userData.descriptionLesson,
            keyPix: keyPix || userData.keyPix,
        }

        if (photo) {
            const s3Storage = new S3Storage()

            const upload = await s3Storage.saveFile(photo)

            data["photo"] = upload

            if (userData.photo) {
                await s3Storage.deleteFile(userData.photo)
            }
        }

        const userEdit = await prismaClient.professional.update({
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

export { EditProfessionalService }