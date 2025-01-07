import prismaClient from '../../prisma'

interface ClientRequest {
    name: string;
    clientId: string;
    academy: string;
    value: number;
    dayDue: number;
    schedule: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }>;
}

class EditClientProfessionalService {
    async execute({ name, clientId, academy, value, dayDue, schedule }: ClientRequest) {

        if (!name || !clientId || !academy || !value || !dayDue || !schedule.length) {
            throw new Error("Todos os campos são obrigatórios")
        }

        let data = {
            name: name,
            academy: academy,
            value: value,
            dayDue: dayDue
        }

        const clientAlreadyExists = await prismaClient.clientsProfessional.findFirst({
            where: {
                id: clientId
            }
        })

        if(!clientAlreadyExists){
            throw new Error("Cliente não encontrado")
        }

        const client = await prismaClient.clientsProfessional.update({
            where: {
                id: clientId
            },
            data: data,
            include: {
                schedules: true
            }
        })

        const arraysDelete = client.schedules.filter((item)=>
            schedule.findIndex((data) => data.dayOfWeek == item.dayOfWeek) == -1
        )

        await Promise.all(
            arraysDelete.map(async item => 
              await prismaClient.schedule.delete({
                where: {
                  id: item.id
                }
              })
            )
        );


        await Promise.all(
            schedule.map(async (item)=>{
                const scheduleDay = await prismaClient.schedule.findUnique({
                    where: { professionalId_clientProfessionalId_dayOfWeek: { professionalId: client.professionalId, clientProfessionalId: client.id, dayOfWeek: item.dayOfWeek } }
                })

                if(scheduleDay){
                    await prismaClient.schedule.update({
                        where: {
                            id: scheduleDay.id
                        },
                        data: {
                            startTime: item.startTime,
                            endTime: item.endTime,
                        }
                    })    
                }else{
                    await prismaClient.schedule.create({
                        data: {
                            professionalId: client.professionalId,
                            clientProfessionalId: client.id,
                            dayOfWeek: item.dayOfWeek,
                            startTime: item.startTime,
                            endTime: item.endTime,
                            recurring: true,
                            isBlock: false,
                            date: new Date()
                        }
                    })    
                }
                
            })
        )

        return client
    }
}

export { EditClientProfessionalService }