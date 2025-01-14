import { addMonths, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import prismaClient from "../../prisma";

interface PaymentRequest {
  userId: string;
  month: number;
  all: boolean;
}

class ListPaymentsService {
  async execute({ userId, month, all }: PaymentRequest) {
    const date = addMonths(new Date(), month);

    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const payments = await prismaClient.payment.findMany({
      where: all
        ? {
            OR: [
              {
                spaceId: userId,
              },
              {
                professionalId: userId,
              },
            ],
          }
        : {
            OR: [
              {
                spaceId: userId,
              },
              {
                professionalId: userId,
              },
            ],
            status: "paid",
            date: {
              gte: startOfMonth(date),
              lte: endOfMonth(date),
            },
          },
      orderBy: {
        date: "desc",
      },
      include: {
        client: true,
        items: true,
      },
    });

    payments.map((item) => {
      if (item.type == "multiple") {
        if (user.role == "PROFESSIONAL") {
          item.value =
            item.items.find((data) => data.type == "lesson").value || 0;
        } else {
          item.value =
            item.items.find((data) => data.type == "diary").value || 0;
        }
      }
    });

    return payments;
  }
}

export { ListPaymentsService };
