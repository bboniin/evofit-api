import prismaClient from "../../prisma";

interface SpaceRequest {
  spaceId: string;
}

class GetSpaceService {
  async execute({ spaceId }: SpaceRequest) {
    const space = await prismaClient.space.findUnique({
      where: {
        id: spaceId,
        isDeleted: false,
      },
      include: {
        photos: true,
        professionals: {
          where: {
            professional: {
              OR: [
                { recipientStatus: "registration" },
                { recipientStatus: "affiliation" },
                { recipientStatus: "active" },
              ],
              finishProfile: true,
              isDeleted: false,
            },
          },
          include: {
            professional: true,
          },
        },
        spaceHours: true,
      },
    });

    if (!space) {
      throw new Error("Espaço não encontrado ou excluido");
    }

    return space;
  }
}

export { GetSpaceService };
