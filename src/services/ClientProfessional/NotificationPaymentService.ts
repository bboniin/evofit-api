import * as OneSignal from 'onesignal-node';  
import prismaClient from '../../prisma';
import { getDay, getHours } from 'date-fns';

class NotificationPaymentService {
    async execute() {

        const day = getDay(new Date())
        const hour = getHours(new Date())

        const clients = await prismaClient.clientsProfessional.findMany({
            where: {
                dayDue: day,
                status: "awaiting_payment" 
            }
        })

        if(hour == 20){
            await prismaClient.clientsProfessional.updateMany({
                where: {
                    dayDue: day,
                    status: "awaiting_payment" 
                },
                data: {
                    status: "overdue"
                }
            })
        }
        
        const clientOneSignal = new OneSignal.Client('15ee78c4-6dab-4cb5-a606-1bb5b12170e1', 'OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw');

        await Promise.all(
            clients.map( async (client)=>{
                    await clientOneSignal.createNotification({
                        headings: {
                            'en': "Mensalidade vence hoje",
                            'pt': "Mensalidade vence hoje",
                        },
                        contents: {
                            'en': "Efetue o pagamento para evitar cancelamento",
                            'pt': "Efetue o pagamento para evitar cancelamento",
                        },
                        include_external_user_ids: [client.clientId]
                    })
            })
        )

        const clientsOverdue = await prismaClient.clientsProfessional.findMany({
            where: {
                dayDue: day-1,
                status: "overdue" 
            },
        })

        await Promise.all(
            clientsOverdue.map( async (client)=>{
                    await clientOneSignal.createNotification({
                        headings: {
                            'en': "Mensalidade está atrasada",
                            'pt': "Mensalidade está atrasada",
                        },
                        contents: {
                            'en': "Efetue o pagamento para evitar cancelamento",
                            'pt': "Efetue o pagamento para evitar cancelamento",
                        },
                        include_external_user_ids: [client.clientId]
                    })
            })
        )
    }
}

export { NotificationPaymentService }