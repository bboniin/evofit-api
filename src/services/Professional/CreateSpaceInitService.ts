import prismaClient from '../../prisma'
import S3Storage from '../../utils/S3Storage';

interface SpaceRequest {
    name: string;
    latitude: number;
    longitude: number;
    photo: string;
    description: string;
}

class CreateSpaceInitService {
    async execute({ name, latitude, longitude, photo, description }: SpaceRequest) {

        if (!name || !latitude || !longitude) {
            throw new Error("Todos os campos são obrigatórios")
        }

        let data = {
            name: name,
            latitude: latitude,
            longitude: longitude,
            description: description,
            userId: null
        }

        if (photo) {
            const s3Storage = new S3Storage()

            const upload = await s3Storage.saveFile(photo)

            data["photo"] = upload
        }

        const space = await prismaClient.space.create({
            data
        })

        return (space)
    }
}

export { CreateSpaceInitService }