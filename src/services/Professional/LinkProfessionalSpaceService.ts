import prismaClient from "../../prisma";

interface ProfessionalRequest {
  userId: string;
  spaceId: string;
}

class LinkProfessionalSpaceService {
  async execute({ userId, spaceId }: ProfessionalRequest) {
    const professional = await prismaClient.professional.findUnique({
      where: {
        id: userId,
        isDeleted: false,
      },
    });

    if (!professional) {
      throw new Error("Profissional não encontrado");
    }

    const space = await prismaClient.space.findUnique({
      where: {
        id: spaceId,
        isDeleted: false,
      },
    });

    if (!space) {
      throw new Error("Espaço não encontrado");
    }

    const link = await prismaClient.professionalSpace.create({
      data: {
        professionalId: userId,
        spaceId: spaceId,
      },
    });

    return link;
  }
}

export { LinkProfessionalSpaceService };
