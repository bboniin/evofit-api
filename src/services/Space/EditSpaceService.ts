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
}

class EditSpaceService {
    async execute({ name, city, state, enableDiarie, descriptionDiarie, valueDiarie, zipCode, address, number, complement, phoneNumber, cnpj, latitude, longitude, description,
        photo, email, mondayOperation, tuesdayOperation, wednesdayOperation, thursdayOperation, fridayOperation, saturdayOperation, sundayOperation, userId }: SpaceRequest) {

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

        let data = {
            name: name || userData.name,
            phoneNumber: phoneNumber || userData.phoneNumber,
            cnpj: cnpj || userData.cnpj,
            description: description || userData.description,
            valueDiarie: valueDiarie || userData.valueDiarie,
            enableDiarie: enableDiarie || userData.enableDiarie,
            descriptionDiarie: descriptionDiarie || userData.descriptionDiarie,
            latitude: latitude || userData.latitude,
            longitude: longitude || userData.longitude,
            state: state || userData.state,
            city: city || userData.city,
            zipCode: zipCode || userData.zipCode,
            number: number || userData.number,
            complement: complement || userData.complement,
            address: address || userData.address,
            mondayOperation: mondayOperation || userData.mondayOperation,
            tuesdayOperation: tuesdayOperation || userData.tuesdayOperation,
            wednesdayOperation: wednesdayOperation || userData.wednesdayOperation,
            thursdayOperation: thursdayOperation || userData.thursdayOperation,
            fridayOperation: fridayOperation || userData.fridayOperation,
            saturdayOperation: saturdayOperation || userData.saturdayOperation,
            sundayOperation: sundayOperation || userData.sundayOperation,
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