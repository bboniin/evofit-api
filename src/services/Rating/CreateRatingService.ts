import { addMinutes } from "date-fns";
import api from "../../config/api";
import prismaClient from "../../prisma";

interface RatingRequest {
  userId: string;
  professionalId: string;
  spaceId: string;
  rate: number;
}

class CreateRatingService {
  async execute({ userId, rate, spaceId, professionalId }: RatingRequest) {
    if (!spaceId && !professionalId) {
      throw new Error("Id do avaliado não enviado");
    }

    const ratingGet = await prismaClient.rating.findFirst({
      where: spaceId
        ? {
            clientId: userId,
            spaceId: spaceId,
          }
        : {
            clientId: userId,
            professionalId: professionalId,
          },
    });

    if (ratingGet) {
      throw new Error(
        `Você já avaliou esse ${spaceId ? "espaço" : "profissional"}`
      );
    }

    const rating = await prismaClient.rating.create({
      data: {
        clientId: userId,
        spaceId: spaceId,
        professionalId: professionalId,
        rate: rate,
        description: "",
      },
    });

    return rating;
  }
}

export { CreateRatingService };
