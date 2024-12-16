import prismaClient from '../../prisma';

interface OrderDiaryRequest {
    paymentId: string;
}

class CancelOrderDiaryService {
    async execute({ paymentId }: OrderDiaryRequest) {

        const payment = await prismaClient.payment.findUnique({
            where: { 
                id: paymentId
             }
        });

        if (!payment) {
            throw new Error('Pedido não encontrado');
        }

        const order = await prismaClient.payment.update({
            where: {
                id: paymentId
            },
            data: {
                status: "cancelado"
            },
        });

        await prismaClient.diary.updateMany({
            where: {
                paymentId: paymentId
            },
            data: {
                status: "cancelado"
            },
        });

        return order;
    }
}

export { CancelOrderDiaryService };
