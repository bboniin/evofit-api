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
                status: "paid"
            },
        });

        await prismaClient.diary.updateMany({
            where: {
                paymentId: paymentId
            },
            data: {
                status: "paid"
            },
        });

        return order;
    }
}

export { ConfirmOrderDiaryService };
