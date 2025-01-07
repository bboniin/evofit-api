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
    schedule: Array<{
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }>;
}

class EditSpaceInitService {
    async execute({ name, spaceId, schedule, latitude, city, state, neighborhood, number, address, zipCode, complement, longitude, photo, description }: SpaceRequest) {

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
            data, 
            include: {
                spaceHours: true
            }
        })

        Promise.all(
            await spaceEdit.spaceHours.map( async (item)=>{
                if(schedule){
                    if(schedule.some((data)=> data.dayOfWeek != item.dayOfWeek))
                    await prismaClient.spaceHours.delete({
                        where: {
                            spaceId_dayOfWeek:{
                                spaceId: spaceId,
                                dayOfWeek: item.dayOfWeek
                            }
                        }    
                    })    
                }
                
            })
        )    

        if(schedule){
            Promise.all(
                await schedule.map( async (item)=>{
                    const spaceHours = await prismaClient.spaceHours.findUnique({
                        where: {
                            spaceId_dayOfWeek:{
                                spaceId: spaceId,
                                dayOfWeek: Number(item.dayOfWeek)
                            }
                        }    
                    })
                    
                    if(spaceHours){
                        await prismaClient.spaceHours.update({
                            where: {
                                id: spaceHours.id
                            },
                            data: {
                                startTime: item.startTime,
                                endTime: item.endTime,
                            }
                        })  
                    }else{
                        await prismaClient.spaceHours.create({
                            data: {
                                spaceId: space.id,
                                dayOfWeek: Number(item.dayOfWeek),
                                startTime: item.startTime,
                                endTime: item.endTime,
                            }
                        })    
                    }
                    
                })
            )    
        }else{
            await prismaClient.spaceHours.deleteMany({
                where: {
                    spaceId: spaceId,
                }    
            })    
        }

        return (spaceEdit)
    }
}

export { EditSpaceInitService }