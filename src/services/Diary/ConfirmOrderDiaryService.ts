import prismaClient from '../../prisma';

interface OrderDiaryRequest {
    paymentId: string;
}

class ConfirmOrderDiaryService {
    async execute({ paymentId }: OrderDiaryRequest) {

        const order = await prismaClient.payment.update({
            where: {
                id: paymentId
            },
            data: {
                status: "confirmado"
            },
        });

        await prismaClient.diary.updateMany({
            where: {
                paymentId: paymentId
            },
            data: {
                status: "confirmado"
            },
        });

        return order;
    }
}

export { ConfirmOrderDiaryService };
