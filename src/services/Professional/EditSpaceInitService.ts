import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface SpaceRequest {
    name: string;
    latitude: number;
    longitude: number;
    photo: string;
    description: string;
    city: string;
    state: string;
    zipCode: string;
    neighborhood: string;
    address: string;
    number: string;
    complement: string;
    spaceId: string;
}

class EditSpaceInitService {
    async execute({ name, spaceId, latitude, city, state, neighborhood, number, address, zipCode, complement, longitude, photo, description }: SpaceRequest) {

        const space = await prismaClient.space.findUnique({
            where: {
                id: spaceId
            }
        })

        if (!space) {
            throw new Error("Espaço não encontrado")
        }

        if (!name || !latitude || !longitude) {
            throw new Error("Nome, Latitude e Longitude são obrigatórios")
        }

        let data = {
            name: name,
            latitude: latitude,
            longitude: longitude,
            description: description,
            city: city,
            state: state,
            zipCode: zipCode,
            neighborhood: neighborhood,
            address: address,
            number: number,
            complement: complement
        }

        if (photo) {
            const s3Storage = new S3Storage()

            const upload = await s3Storage.saveFile(photo)

            data["photo"] = upload

            if (space.photo) {
                await s3Storage.deleteFile(space.photo)
            }
        }

        const spaceEdit = await prismaClient.space.update({
            where: {
                id: spaceId
            },
            data
        })

        return (spaceEdit)
    }
}

export { EditSpaceInitService }