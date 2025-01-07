import { endOfDay } from 'date-fns';
import prismaClient from '../../prisma';

interface UserRequest {
    userId: string;
}

class FrequencyBookingService {
    async execute({ userId }: UserRequest) {

        const client = await prismaClient.client.findUnique({
            where: { 
                userId: userId
             }
        });

        if (!client) {
            throw new Error('Cliente não encontrado');
        }

        const bookings = await prismaClient.booking.findMany({
            where: {
                clientId: client.id,
                date: {lte: endOfDay(new Date())}
            },
            include: {
                professional: true
            }
        });

        return bookings;
    }
}

export { FrequencyBookingService };
