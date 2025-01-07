import prismaClient from "../../prisma";

interface ClientRequest {
  id: string;
  userId: string;
}

class GetClientProfessionalService {
  async execute({ id, userId }: ClientRequest) {
    const client = await prismaClient.clientsProfessional.findUnique({
      where: {
        id: id,
        professionalId: userId,
      },
      include: {
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
