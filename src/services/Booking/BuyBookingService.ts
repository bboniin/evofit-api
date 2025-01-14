import {
  format,
  isBefore,
  isEqual,
  isAfter,
  startOfDay,
  endOfDay,
  parse,
  addMinutes,
} from "date-fns";
import prismaClient from "../../prisma";
import api from "../../config/api";

interface BookingRequest {
  professionalId: string;
  clientId: string;
  date: Date;
  startTime: string;
  endTime: string;
}

class BuyBookingService {
  async execute({
    professionalId,
    clientId,
    date,
    startTime,
    endTime,
  }: BookingRequest) {
    const startDateTime = new Date(
      `${format(date, "yyyy-MM-dd")}T${startTime}`
    );
    const endDateTime = new Date(`${format(date, "yyyy-MM-dd")}T${endTime}`);

    const client = await prismaClient.client.findUnique({
      where: {
        userId: clientId,
      },
      include: {
        user: true,
      },
    });

    const professional = await prismaClient.professional.findUnique({
      where: {
        userId: professionalId,
      },
    });

    if (!client) {
      throw new Error("Cliente não encontrado");
    }

    if (!professional) {
      throw new Error("Personal não encontrado");
    }

    const dayOfWeek = new Date(date).getDay();

    const workSchedule = await prismaClient.workSchedule.findUnique({
      where: { professionalId_dayOfWeek: { professionalId, dayOfWeek } },
    });

    if (!workSchedule) {
      throw new Error("Horário de trabalho não encontrado para este dia");
    }

    const workStartTime = new Date(
      `${format(date, "yyyy-MM-dd")}T${workSchedule.startTime}`
    );
    const workEndTime = new Date(
      `${format(date, "yyyy-MM-dd")}T${workSchedule.endTime}`
    );
    if (
      isBefore(startDateTime, workStartTime) ||
      isAfter(endDateTime, workEndTime)
    ) {
      throw new Error("O horário selecionado está fora do horário de trabalho");
    }

    const schedules = await prismaClient.schedule.findMany({
      where: {
        professionalId,
        OR: [{ recurring: true, dayOfWeek }, { date: date }],
      },
    });

    const bookings = await prismaClient.booking.findMany({
      where: {
        professionalId,
        AND: [
          {
            date: { gte: startOfDay(date) },
          },
          {
            date: { lte: endOfDay(date) },
          },
        ],
      },
    });

    const isBlocked = schedules.some(
      (schedule) =>
        (isAfter(startDateTime, parse(schedule.startTime, "HH:mm", date)) ||
          isEqual(startDateTime, parse(schedule.startTime, "HH:mm", date))) &&
        (isBefore(endDateTime, parse(schedule.endTime, "HH:mm", date)) ||
          isEqual(endDateTime, parse(schedule.endTime, "HH:mm", date))) &&
        schedule.isBlock
    );

    if (isBlocked) {
      throw new Error("O horário não está disponivel");
    }

    const isBooked = bookings.some(
      (booking) =>
        (isAfter(startDateTime, parse(booking.startTime, "HH:mm", date)) ||
          isEqual(startDateTime, parse(booking.startTime, "HH:mm", date))) &&
        (isBefore(endDateTime, parse(booking.endTime, "HH:mm", date)) ||
          isEqual(endDateTime, parse(booking.endTime, "HH:mm", date)))
    );

    if (isBooked) {
      throw new Error("O horário não está disponivel");
    }

    let order = {};

    const valueLessonAll = professional.valueLesson * 100;
    const valuePaid = valueLessonAll * 1.02;

    await api
      .post("/orders", {
        closed: true,
        items: [
          {
            amount: valuePaid,
            description: "Diária Academia",
            quantity: 1,
            code: 1,
          },
        ],
        customer: {
          name: client.name,
          type: "individual",
          document: client.cpf,
          email: client.user.email,
          phones: {
            mobile_phone: {
              country_code: "55",
              number: "000000000",
              area_code: "11",
            },
          },
        },
        payments: [
          {
            payment_method: "pix",
            pix: {
              expires_in: 1800,
              additional_information: [
                {
                  name: "information",
                  value: "number",
                },
              ],
            },
            split: [
              {
                amount: valueLessonAll,
                recipient_id: professional.recipientId,
                type: "flat",
                options: {
                  charge_processing_fee: false,
                  charge_remainder_fee: false,
                  liable: false,
                },
              },
              {
                amount: valuePaid - valueLessonAll,
                recipient_id: "re_cm2uxwdzw3j720m9tiinncic7",
                type: "flat",
                options: {
                  charge_processing_fee: true,
                  charge_remainder_fee: true,
                  liable: true,
                },
              },
            ],
          },
        ],
      })
      .then(async (response) => {
        order = await prismaClient.payment.create({
          data: {
            description: "Aula Personal",
            professionalId,
            clientId: client.id,
            type: "diary",
            rate: (valuePaid - valueLessonAll) / 100,
            value: valueLessonAll / 100,
            orderId: response.data.id,
            expireAt: addMinutes(new Date(), 30),
            items: {
              create: [
                {
                  type: "lesson",
                  value: professional.valueLesson,
                  amount: 1,
                },
              ],
            },
          },
        });

        await prismaClient.booking.create({
          data: {
            professionalId,
            clientId: client.id,
            startTime: startTime,
            paymentId: order["id"],
            spaceId: client.id,
            date: date,
            endTime: endTime,
            status: "pending",
          },
        });
      })
      .catch((e) => {
        console.log(e.response.data);
        throw new Error("Ocorreu um erro ao criar cobrança");
      });

    return order;
  }
}

export { BuyBookingService };
