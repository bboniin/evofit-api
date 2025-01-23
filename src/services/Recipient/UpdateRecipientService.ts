import api from "../../config/api";
import prismaClient from "../../prisma";

interface RecipientRequest {
  userId: string;
  bank: string;
  account: string;
  branch: string;
  type: string;
}

class UpdateRecipientService {
  async execute({ userId, bank, type, branch, account }: RecipientRequest) {
    const spaceOrProfessional = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        space: true,
        professional: true,
      },
    });

    if (!spaceOrProfessional) {
      throw new Error("Usuário não encontrado");
    } else {
      if (!spaceOrProfessional.space && !spaceOrProfessional.professional) {
        throw new Error("Usuário não encontrado");
      }
    }

    const user = spaceOrProfessional.space || spaceOrProfessional.professional;
    const userType = user.typeUser == "PJ" ? "corporation" : "individual";

    const [account_number, account_check_digit] = account.split("-");
    const [branch_number, branch_check_digit] = branch.split("-");

    await api
      .patch(`/recipients/${user.recipientId}/default-bank-account`, {
        bank_account: {
          holder_name: user.name,
          holder_type: userType,
          holder_document: user.cpfOrCnpj,
          bank: bank,
          branch_number: branch_number,
          branch_check_digit: branch_check_digit || "",
          account_number: account_number,
          account_check_digit: account_check_digit,
          type: type,
        },
      })
      .then(() => {
        return { message: "Conta atualizada" };
      })
      .catch((e) => {
        throw new Error("Ocorreu um erro ao editar conta bancária");
      });
  }
}

export { UpdateRecipientService };
