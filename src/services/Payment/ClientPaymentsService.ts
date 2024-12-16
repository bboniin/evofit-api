import prismaClient from '../../prisma';

interface PaymentRequest {
    userId: string;
}

class ClientPaymentsService {
    async execute({ userId }: PaymentRequest) {

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

        const payments = await prismaClient.payment.findMany({
            where: {
                clientId: client.id
            },
            orderBy: {
                date: "desc"
            },
            include: {
                space: true,
                professional: true
            }
        })
        
        return payments
    }
}

export { ClientPaymentsService };
