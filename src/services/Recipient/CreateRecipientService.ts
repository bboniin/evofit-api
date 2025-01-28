import api from "../../config/api";
import prismaClient from "../../prisma";

interface RecipientRequest {
  userId: string;
  bank: string;
  account: string;
  branch: string;
  type: string;
  trading_name: string;
  company_name: string;
}

class CreateRecipientService {
  async execute({
    userId,
    bank,
    type,
    company_name,
    trading_name,
    branch,
    account,
  }: RecipientRequest) {
    const spaceOrProfessional = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        space: {
          where: {
            isDeleted: false,
          },
        },
        professional: {
          where: {
            isDeleted: false,
          },
        },
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
    const userType = user.typeUser == "PJ" ? "company" : "individual";

    const [account_number, account_check_digit] = account.split("-");
    const [branch_number, branch_check_digit] = branch.split("-");

    let responseUser = {};

    await api
      .post("/recipients", {
        name: user.name,
        email: spaceOrProfessional.email,
        description: "",
        document: user.cpfOrCnpj,
        type: userType,
        company_name: company_name,
        trading_name: trading_name,
        annual_revenue: 1000000,
        default_bank_account: {
          holder_name: user.name,
          holder_type: userType,
          holder_document: user.cpfOrCnpj,
          bank: bank,
          branch_number: branch_number,
          branch_check_digit: branch_check_digit || "0",
          account_number: account_number,
          account_check_digit: account_check_digit,
          type: type,
        },
        metadata: {
          key: "value",
        },
      })
      .then(async (response) => {
        if (spaceOrProfessional.space) {
          const space = await prismaClient.space.update({
            where: {
              id: user.id,
            },
            data: {
              recipientId: response.data.id,
              recipientStatus: "registration",
            },
          });

          responseUser = {
            ...space,
            role: spaceOrProfessional.role,
            email: spaceOrProfessional.email,
          };
        } else {
          const professional = await prismaClient.professional.update({
            where: {
              id: user.id,
            },
            data: {
              recipientId: response.data.id,
              recipientStatus: "registration",
            },
          });

          responseUser = {
            ...professional,
            role: spaceOrProfessional.role,
            email: spaceOrProfessional.email,
          };
        }
      })
      .catch((e) => {
        console.log(e.response);
        throw new Error("Ocorreu um erro ao adicionar conta bancária");
      });

    return responseUser;
  }
}

export { CreateRecipientService };
