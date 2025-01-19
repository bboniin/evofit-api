import prismaClient from "../../prisma";

interface ClientRequest {
  clientId: string;
  userId: string;
}

class GetClientProfessionalService {
  async execute({ clientId, userId }: ClientRequest) {
    const client = await prismaClient.clientsProfessional.findUnique({
      where: {
        id: clientId,
        professionalId: userId,
      },
      include: {
        space: true,
        client: {
          include: {
            payments: {
              where: {
                professionalId: userId,
                recurring: true,
              },
            },
          },
        },
        schedules: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    return client;
  }
}

export { GetClientProfessionalService };
