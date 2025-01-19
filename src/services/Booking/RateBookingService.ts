import prismaClient from "../../prisma";

interface UserRequest {
  bookingId: string;
  rate: number;
  comment: string;
  status: string;
}

class RateBookingService {
  async execute({ bookingId, rate, comment, status }: UserRequest) {
    const booking = await prismaClient.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        space: true,
        professional: true,
        client: true,
        ratings: true,
      },
    });

    if (!booking) {
      throw new Error("Aula não encontrada");
    }

    if (booking.ratings.length) {
      throw new Error("Aula já foi avaliada");
    }

    await prismaClient.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status_attendance: status == "completed" ? "completed" : "missed",
      },
    });

    const rating = await prismaClient.rating.create({
      data: {
        bookingId: booking.id,
        clientId: booking.clientId,
        professionalId: booking.professionalId,
        rate: rate,
        comment: comment,
      },
    });

    return rating;
  }
}

export { RateBookingService };
