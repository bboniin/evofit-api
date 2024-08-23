import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface SpaceRequest {
    name: string;
    photo: string;
    phoneNumber: string;
    email: string;
    cnpj: string;
    userId: string;
    description: string;
    latitude: number;
    longitude: number;
    valueDiarie: number;
    enableDiarie: boolean;
    descriptionDiarie: string;
    city: string;
    state: string;
    zipCode: string;
    number: string;
    complement: string;
    address: string;
    mondayOperation: string;
    tuesdayOperation: string;
    wednesdayOperation: string;
    thursdayOperation: string;
    fridayOperation: string;
    saturdayOperation: string;
    sundayOperation: string;
    keyPix: string;
    typePix: string;
    type: string;
}

class EditSpaceService {
    async execute({ name, city, keyPix, typePix, type, state, enableDiarie, descriptionDiarie, valueDiarie, zipCode, address, number, complement, phoneNumber, cnpj, latitude, longitude, description,
        photo, email, mondayOperation, tuesdayOperation, wednesdayOperation, thursdayOperation, fridayOperation, saturdayOperation, sundayOperation, userId }: SpaceRequest) {

        let data = {}

        const user = await prismaClient.user.findUnique({
            where: {
                id: userId,
                role: "SPACE"
            },
            include: {
                space: true
            }
        })

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        const userData = {
            email: user.email,
            ...user.space
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
                phoneNumber: phoneNumber || userData.phoneNumber,
                cnpj: cnpj || userData.cnpj,
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
            if(!enableDiarie || !valueDiarie || !descriptionDiarie || !keyPix || !typePix){
                throw new Error("Ative a Diaria e preencha todos os campos")
            }
            data = {
                valueDiarie: valueDiarie,
                enableDiarie: enableDiarie,
                descriptionDiarie: descriptionDiarie,
                keyPix: keyPix,
                typePix: typePix,
                finishBank: true
            }
        }

        if(type == "address"){
            if(!latitude || !longitude || !state || !city || !zipCode || !number || !address){
                throw new Error("Preencha todos os campos obrigatórios")
            }
            data = {
                latitude: latitude,
                longitude: longitude,
                state: state,
                city: city,
                zipCode: zipCode,
                number: number,
                complement: complement,
                address: address,
                finishAddress: true
            }
        }

        if(type == "time"){
            data = {
                mondayOperation: mondayOperation,
                tuesdayOperation: tuesdayOperation,
                wednesdayOperation: wednesdayOperation,
                thursdayOperation: thursdayOperation,
                fridayOperation: fridayOperation,
                saturdayOperation: saturdayOperation,
                sundayOperation: sundayOperation,
                finishTime: true
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

        const userEdit = await prismaClient.space.update({
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

export { EditSpaceService }