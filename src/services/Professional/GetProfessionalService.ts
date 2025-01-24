import prismaClient from "../../prisma";

interface ProfessionalRequest {
  professionalId: string;
}

class GetProfessionalService {
  async execute({ professionalId }: ProfessionalRequest) {
    const professional = await prismaClient.professional.findUnique({
      where: {
        userId: professionalId,
        isDeleted: false,
      },
      include: {
        photos: true,
        clientsProfessional: {
          where: {
            clientId: {
              not: null,
            },
          },
          include: {
            client: true,
          },
        },
      },
    });

    if (!professional) {
      throw new Error("Profissional não encontrado ou excluido");
    }

    professional["clientsTotal"] = professional.clientsProfessional.length;
    professional.clientsProfessional = professional.clientsProfessional.slice(
      0,
      4
    );

    return professional;
  }
}

export { GetProfessionalService };
