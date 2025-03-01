import prismaClient from "../../prisma";

interface ClientRequest {
  userId: string;
}

class ListClientsProfessionalService {
  async execute({ userId }: ClientRequest) {
    const clients = await prismaClient.clientsProfessional.findMany({
      where: {
        professionalId: userId,
        visible: true,
        status: {
          not: "cancelled",
        },
      },
      include: {
        client: true,
        space: true,
      },
    });

    return clients;
  }
}

export { ListClientsProfessionalService };
