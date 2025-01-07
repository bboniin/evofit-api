import { addMonths, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import prismaClient from '../../prisma';

interface PaymentRequest {
    userId: string;
    month: number;
    all: boolean;
}

class ListPaymentsService {
    async execute({ userId, month, all }: PaymentRequest) {

        const date = addMonths(new Date(), month)

        const payments = await prismaClient.payment.findMany({
            where: all ? {
                    OR: [{
                        spaceId: userId,
                    },{
                        professionalId: userId,
                    }]
                } : {
                    OR: [{
                        spaceId: userId,
                    },{
                        professionalId: userId,
                    }],
                    status: "paid",
                    date: {
                    gte: startOfMonth(date),
                    lte: endOfMonth(date),
                },
            },
            orderBy: {
                date: "desc"
            },
            include: {
                client: true
            }
        })
        
        return payments
    }
}

export { ListPaymentsService };
