import api from '../../config/api';
import prismaClient from '../../prisma';

interface PaymentRequest {
    userId: string;
    paymentId: string;
}

class GetPaymentService {
    async execute({ userId, paymentId }: PaymentRequest) {

        const client = await prismaClient.client.findUnique({
            where: { 
                id: userId
            },
            include: {
                user: true
            },
        });

        if (!client) {
            throw new Error('Usuário não encontrado');
        }

        const payment = await prismaClient.payment.findUnique({
            where: {
                id: paymentId
            },
            include: {
                space: true,
                professional: true,
                client: true
            }
        })
        let recipient = {}

        await api.get(`/orders/${payment.orderId}`).then((response)=>{
            recipient = response.data
        }).catch((e)=>{
            throw new Error('Ocorreu um erro ao obter informações do pedido');
        })

        payment["order"] = recipient

        if (!payment) {
            throw new Error('Pagamento não encontrado');
        }
        
        return payment
    }
}

export { GetPaymentService };
