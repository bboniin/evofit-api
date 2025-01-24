import prismaClient from "../../prisma";

interface SpaceRequest {
  minLatitude: number;
  minLongitude: number;
  maxLatitude: number;
  maxLongitude: number;
}

class ListSpacesService {
  async execute({
    minLatitude,
    minLongitude,
    maxLatitude,
    maxLongitude,
  }: SpaceRequest) {
    const spaces = await prismaClient.space.findMany({
      where: {
        isDeleted: false,
        latitude: {
          gte: minLatitude,
          lte: maxLatitude,
        },
        longitude: {
          gte: minLongitude,
          lte: maxLongitude,
        },
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
      },
    });

    return spaces;
  }
}

export { ListSpacesService };
