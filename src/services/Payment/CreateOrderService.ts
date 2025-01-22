import {
  addMinutes,
  endOfDay,
  isAfter,
  isBefore,
  isEqual,
  parse,
  startOfDay,
} from "date-fns";
import api from "../../config/api";
import prismaClient from "../../prisma";
import { format } from "date-fns";

interface OrderRequest {
  spaceId: string;
  professionalId: string;
  clientId: string;
  amount: number;
  date: Date;
  startTime: string;
  endTime: string;
  buyDiarie: boolean;
}

class CreateOrderService {
  async execute({
    spaceId,
    clientId,
    date,
    startTime,
    endTime,
    professionalId,
    amount,
    buyDiarie,
  }: OrderRequest) {
    const client = await prismaClient.client.findUnique({
      where: {
        userId: clientId,
      },
      include: {
        user: true,
      },
    });

    if (!client) {
      throw new Error("Cliente não encontrado");
    }

    const space = await prismaClient.space.findUnique({
      where: {
        id: spaceId,
      },
    });

    if (!space) {
      throw new Error("Espaço não encontrado");
    }

    let professional = null;

    if (professionalId) {
      professional = await prismaClient.professional.findUnique({
        where: {
          userId: professionalId,
        },
      });

      if (!professional && professionalId) {
        throw new Error("Profissional não encontrado");
      }

      if (!startTime || !date || !endTime) {
        throw new Error("Data e horários de inicio e fim são obrigatórios");
      }
      const startDateTime = new Date(
        `${format(date, "yyyy-MM-dd")}T${startTime}`
      );
      const endDateTime = new Date(`${format(date, "yyyy-MM-dd")}T${endTime}`);

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
        throw new Error(
          "O horário selecionado está fora do horário de trabalho"
        );
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
    }
    let order = {};

    const type =
      buyDiarie && professionalId
        ? "multiple"
        : professionalId
        ? "lesson"
        : "diary";

    const valueDiarieAll =
      (type == "multiple"
        ? space.valueDiarie + professional.valueLesson
        : type == "diary"
        ? space.valueDiarie * amount
        : professional.valueLesson) * 100;
    const valuePaid = valueDiarieAll * 1.02;

    await api
      .post("/orders", {
        closed: true,
        items: [
          {
            amount: valuePaid,
            description:
              type == "multiple"
                ? "Diária e Aula"
                : type == "diary"
                ? "Diária Academia"
                : "Aula Personal",
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
                amount: valueDiarieAll,
                recipient_id: space.recipientId,
                type: "flat",
                options: {
                  charge_processing_fee: false,
                  charge_remainder_fee: false,
                  liable: false,
                },
              },
              {
                amount: valuePaid - valueDiarieAll,
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
            description:
              type == "multiple"
                ? "Diária e Aula"
                : type == "diary"
                ? "Diária Academia"
                : "Aula Personal",
            spaceId: type != "lesson" ? spaceId : null,
            professionalId: type != "diary" ? professionalId : null,
            type: type,
            clientId: client.id,
            rate: (valuePaid - valueDiarieAll) / 100,
            value: valueDiarieAll / 100,
            orderId: response.data.id,
            expireAt: addMinutes(new Date(), 30),
            items: {
              create:
                type == "diary"
                  ? [
                      {
                        type: "diary",
                        amount: amount,
                        value: space.valueDiarie,
                      },
                    ]
                  : type == "lesson"
                  ? [
                      {
                        type: "lesson",
                        amount: 1,
                        value: professional.valueLesson,
                      },
                    ]
                  : [
                      {
                        type: "lesson",
                        amount: 1,
                        value: professional.valueLesson,
                      },
                      {
                        type: "diary",
                        amount: 1,
                        value: space.valueDiarie,
                      },
                    ],
            },
          },
        });
        if (type != "diary") {
          await prismaClient.booking.create({
            data: {
              professionalId,
              clientId: client.id,
              startTime: startTime,
              paymentId: order["id"],
              date: date,
              endTime: endTime,
              spaceId: spaceId,
              status: "pending",
            },
          });
        }
      })
      .catch((e) => {
        throw new Error("Ocorreu um erro ao criar cobrança");
      });

    return order;
  }
}

export { CreateOrderService };
