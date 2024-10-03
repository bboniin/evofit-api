import prismaClient from '../../prisma'

interface ClientRequest {
    name: string;
    phoneNumber: string;
    email: string;
    academy: string;
    value: number;
    dayDue: string;
    professionalId: string;
    schedule: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }>;
}

class CreateClientProfessionalService {
    async execute({ name, professionalId, phoneNumber, email, academy, value, dayDue, schedule }: ClientRequest) {

        if (!name || !phoneNumber || !professionalId || !academy || !value || !dayDue || !email || !schedule.length) {
            throw new Error("Todos os campos são obrigatórios")
        }

        let data = {
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            academy: academy,
            value: value,
            professionalId: professionalId,
            status: "pendente",
            dayDue: dayDue
        }

        const userAlreadyExists = await prismaClient.user.findFirst({
            where: {
                email: email,
                OR: [{
                    role: "PROFESSIONAL"
                },{
                    role: "SPACE"
                }]
            }
        })

        if(userAlreadyExists){
            throw new Error("Email já está sendo usado por outro tipo de usuário")
        }

        const clientAlreadyExists = await prismaClient.user.findFirst({
            where: {
                email: email,
            }
        })

        if(clientAlreadyExists){
            data["clientId"] = clientAlreadyExists.id

            const clientProfessionalAlreadyExists = await prismaClient.clientsProfessional.findFirst({
                where: {
                    clientId: clientAlreadyExists.id,
                }
            })

            if(clientProfessionalAlreadyExists){
                throw new Error("Você já cadastrou um aluno usando esse email")
            }
        }

        const client = await prismaClient.clientsProfessional.create({
            data: data
        })

        schedule.map(async (item)=>{
            await prismaClient.schedule.create({
                data: {
                    professionalId: professionalId,
                    clientProfessionalId: client.id,
                    dayOfWeek: item.dayOfWeek,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    recurring: true,
                    isBlock: false,
                    date: new Date()
                }
            })
        })

        return client
    }
}

export { CreateClientProfessionalService }