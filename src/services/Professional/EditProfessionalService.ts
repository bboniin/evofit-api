import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface ProfessionalRequest {
    name: string;
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
    typePix: string;
    type: string;
}

class EditProfessionalService {
    async execute({ name, birthday, phoneNumber, photo, email, cref, description, valueConsultancy, userId,
        enableConsultancy, typePix, type, descriptionConsultancy, valueLesson, enableLesson, keyPix, descriptionLesson, cpf }: ProfessionalRequest) {

        let data = {}

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

        if(type == "account"){        
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
                cref: cref || userData.cref,
                cpf: cpf || userData.cpf,
            }
        }

        if(type == "profile"){
            if(!description || (!photo && !userData.photo)){
                throw new Error("Foto de perfil e descrição são obrigatórios")
            }
            data = {
                description: description || userData.description,
                finishProfile: true
            }
        }

        if(type == "bank"){
            if(!enableLesson && !enableConsultancy){
                throw new Error("Ative pelo menos um serviço")
            }
            if(!keyPix || !typePix){
                throw new Error("Preencha o tipo e chave PIX")
            }
            if(enableLesson && (!valueLesson || !descriptionLesson)){
                throw new Error("Preencha valor e descrição da aula individual")
            }
            if(enableConsultancy && (!valueConsultancy || !descriptionConsultancy)){
                throw new Error("Preencha valor e descrição da aula individual")
            }
            data = {
                valueConsultancy: valueConsultancy,
                enableConsultancy: enableConsultancy,
                descriptionConsultancy: descriptionConsultancy,
                valueLesson: valueLesson,
                enableLesson: enableLesson,
                descriptionLesson: descriptionLesson,
                keyPix: keyPix,
                typePix: typePix,
                finishBank: true
            }
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