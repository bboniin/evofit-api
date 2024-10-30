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
    schedule: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }>;
}

class CreateSpaceInitService {
    async execute({ name, latitude, schedule, longitude, photo, description, city, state, neighborhood, number, address, zipCode, complement }: SpaceRequest) {

        if (!name || !latitude || !longitude) {
            throw new Error("Todos os campos são obrigatórios")
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
            complement: complement,
            userId: null
        }

        if (photo) {
            const s3Storage = new S3Storage()

            const upload = await s3Storage.saveFile(photo)

            data["photo"] = upload
        }

        const space = await prismaClient.space.create({
            data,
        })

        if(schedule){
            Promise.all(
                await schedule.map( async (item)=>{
                    await prismaClient.spaceHours.create({
                        data: {
                            spaceId: space.id,
                            dayOfWeek: Number(item.dayOfWeek),
                            startTime: item.startTime,
                            endTime: item.endTime,
                        }
                    })
                })
            )    
        }
        
        return (space)
    }
}

export { CreateSpaceInitService }