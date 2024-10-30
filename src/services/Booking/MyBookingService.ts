import { startOfDay } from 'date-fns';
import prismaClient from '../../prisma';

interface UserRequest {
    userId: string;
}

class MyBookingService {
    async execute({ userId }: UserRequest) {

        const client = await prismaClient.client.findUnique({
            where: { 
                userId: userId
             }
        });

        if (!client) {
            throw new Error('Cliente não encontrado');
        }

        const schedules = await prismaClient.clientsProfessional.findMany({
            where: {
                clientId: client.id,
                status: {
                    not: "cancelado",
                },
            },
            include: {
                professional: true,
                schedules: true
            }
        });

        const bookings = await prismaClient.booking.findMany({
            where: {
                clientId: client.id,
                date: {gte: startOfDay(new Date())}
            },
            include: {
                professional: true
            }
        });

        return {schedules, bookings};
    }
}

export { MyBookingService };
