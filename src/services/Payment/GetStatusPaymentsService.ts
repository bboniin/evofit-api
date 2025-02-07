import prismaClient from "../../prisma";

interface PaymentRequest {
  userId: string;
}

class GetStatusPaymentsService {
  async execute({ userId }: PaymentRequest) {
    const clientProfessionals = await prismaClient.clientsProfessional.findMany(
      {
        where: {
          clientId: userId,
          status: {
            not: "cancelled",
          },
        },
      }
    );

    let status = "";

    clientProfessionals.map((item) => {
      if (!status && item.status == "active") {
        status = "active";
      }
      if (
        (!status || status == "awaiting_payment") &&
        item.status == "awaiting_payment"
      ) {
        status = "awaiting_payment";
      }
      if (
        (!status || status == "active" || status == "awaiting_payment") &&
        item.status == "overdue"
      ) {
        status = "overdue";
      }
    });

    return status;
  }
}

export { GetStatusPaymentsService };
