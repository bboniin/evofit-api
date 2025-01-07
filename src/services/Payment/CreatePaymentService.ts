import * as OneSignal from 'onesignal-node';  
import prismaClient from '../../prisma';

interface OrderRequest {
    data: object;
}

const client = new OneSignal.Client('15ee78c4-6dab-4cb5-a606-1bb5b12170e1', 'OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw');

async function sendNotification(title, text, sendIds) {
    await client.createNotification({
        headings: {
            'en': title,
            'pt': title,
        },
        contents: {
            'en': text,
            'pt': text,
        },
        include_external_user_ids: sendIds
    })
}

class CreatePaymentService {
    async execute({ data }: OrderRequest) {

        const payment = await prismaClient.payment.findUnique({
            where: { 
                orderId: data["data"]["id"]
            },
            include: {
                client: true,
                professional: true,
                space: true
            }
        });

        if (!payment) {
            throw new Error('Pagamento não encontrado');
        }

        if(payment.type == "RECURRING"){
            await sendNotification("Mensalidade Pendente",
                "Efetue o pagamento da mensalidade",
                [payment.clientId]
            )
            await sendNotification("Cobrança emitida",
                `${payment.client.name} no valor de ${payment.value}`,
                [payment.professionalId]
            )
        }else{
            if(payment.type == "LESSON"){
                await sendNotification("Pedido realizado",
                    "Efetue o pagamento para confirmar sua aula",
                    [payment.clientId]
                )

                await sendNotification("Novo pedido",
                    `${payment.client.name} fez um pedido`,
                    [payment.professionalId]
                )
            }else{
                await sendNotification("Pedido realizado",
                    "Efetue o pagamento para confirmar suas diárias",
                    [payment.clientId]
                )

                await sendNotification("Novo pedido",
                    `${payment.client.name} fez um pedido`,
                    [payment.spaceId]
                )
            }
        }

        return(data)
    }
}

export { CreatePaymentService }