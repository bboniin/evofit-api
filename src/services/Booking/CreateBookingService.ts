import { format, isBefore, isEqual, isAfter, startOfDay, endOfDay, parse } from 'date-fns';
import prismaClient from '../../prisma';

interface BookingRequest {
    professionalId: string;
    clientId: string;
    date: Date;
    startTime: string; 
    endTime: string;
}

class CreateBookingService {
    async execute({ professionalId, clientId, date, startTime, endTime }: BookingRequest) {

        const startDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}`);
        const endDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${endTime}`);

        const client = await prismaClient.client.findUnique({
            where: { 
                userId: clientId
             }
        });

        if (!client) {
            throw new Error('Cliente não encontrado');
        }

        const dayOfWeek = new Date(date).getDay();

        const workSchedule = await prismaClient.workSchedule.findUnique({
            where: { professionalId_dayOfWeek: { professionalId, dayOfWeek } }
        });

        if (!workSchedule) {
            throw new Error('Horário de trabalho não encontrado para este dia');
        }

        const workStartTime = new Date(`${format(date, 'yyyy-MM-dd')}T${workSchedule.startTime}`);
        const workEndTime = new Date(`${format(date, 'yyyy-MM-dd')}T${workSchedule.endTime}`);
        if (isBefore(startDateTime, workStartTime) || isAfter(endDateTime, workEndTime)) {
            throw new Error('O horário selecionado está fora do horário de trabalho');
        }

        const schedules = await prismaClient.schedule.findMany({
            where: {
                professionalId,
                OR: [
                    { recurring: true, dayOfWeek }, // Recorrente no dia
                    { date: date }, // Específico para essa data
                ],
            },
        });

        const bookings = await prismaClient.booking.findMany({
            where: {
                professionalId,
                AND: [{
                    date: {gte: startOfDay(date)}
                },{
                    date: {lte: endOfDay(date)}
                }]
            },
        });

        const isBlocked = schedules.some(schedule => 
            (isAfter(startDateTime, parse(schedule.startTime, 'HH:mm', date)) || isEqual(startDateTime, parse(schedule.startTime, 'HH:mm', date))) &&
            (isBefore(endDateTime, parse(schedule.endTime, 'HH:mm', date)) || isEqual(endDateTime, parse(schedule.endTime, 'HH:mm', date))) &&
            schedule.isBlock
        );

        if (isBlocked) {
            throw new Error('O horário não está disponivel');
        }

        // Verificar se o horário já está reservado
        const isBooked = bookings.some(booking =>
            (isAfter(startDateTime, parse(booking.startTime, 'HH:mm', date)) || isEqual(startDateTime, parse(booking.startTime, 'HH:mm', date))) &&
            (isBefore(endDateTime, parse(booking.endTime, 'HH:mm', date)) || isEqual(endDateTime, parse(booking.endTime, 'HH:mm', date)))
        );

        if (isBooked) {
            throw new Error('O horário não está disponivel');
        }

        const booking = await prismaClient.booking.create({
            data: {
                professionalId,
                clientId: client.id,
                startTime: startTime,
                date: date,
                endTime: endTime,
            },
        });

        return booking;
    }
}

export { CreateBookingService };
