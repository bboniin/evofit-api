import prismaClient from "../../prisma";

interface ClientRequest {
  clientId: string;
  professionalId: string;
}

class DeleteClientProfessionalService {
  async execute({ clientId, professionalId }: ClientRequest) {
    const clientAlreadyExists =
      await prismaClient.clientsProfessional.findFirst({
        where: {
          id: clientId,
        },
      });

    if (!clientAlreadyExists) {
      throw new Error("Cliente não encontrado");
    }

    if (clientAlreadyExists.status == "registration_pending") {
      await prismaClient.clientsProfessional.delete({
        where: {
          id: clientId,
        },
      });
    } else {
      await prismaClient.clientsProfessional.update({
        where: {
          id: clientId,
        },
        data: {
          status: "cancelled",
          email: clientAlreadyExists.id + "/" + clientAlreadyExists.email,
        },
      });
    }

    return "Deletado com sucesso";
  }
}

export { DeleteClientProfessionalService };
