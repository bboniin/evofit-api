import prismaClient from "../../prisma";

interface UserRequest {
  bookingId: string;
}

class GetBookingService {
  async execute({ bookingId }: UserRequest) {
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

    return booking;
  }
}

export { GetBookingService };
