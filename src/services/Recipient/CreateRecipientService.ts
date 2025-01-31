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
  name: string;
  cpf: string;
  birthday: string;
  address: string;
  neighborhood: string;
  number: string;
  zipCode: string;
  complement: string;
  state: string;
  city: string;
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
    name,
    cpf,
    birthday,
    address,
    neighborhood,
    number,
    zipCode,
    complement,
    state,
    city,
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

    const userType = user.typeUser == "PJ" ? "corporation" : "individual";
    const userTypeBank = user.typeUser == "PJ" ? "company" : "individual";

    const phoneNumber = user.phoneNumber.replace(/\D/g, "");
    const phoneNumbers = [
      {
        ddd: phoneNumber.slice(0, 2),
        number: phoneNumber.slice(2),
        type: "mobile",
      },
    ];

    const [account_number, account_check_digit] = account.split("-");
    const [branch_number, branch_check_digit] = branch.split("-");

    let responseUser = {};

    const objectRecipient =
      user.typeUser == "PJ"
        ? {
            register_information: {
              name: user.name,
              email: spaceOrProfessional.email,
              description: "",
              document: user.cpfOrCnpj,
              type: userType,
              company_name: company_name,
              trading_name: trading_name,
              annual_revenue: 1000000,
              main_address: {
                street: address,
                complementary: complement,
                street_number: number,
                neighborhood: neighborhood,
                city: city,
                state: state,
                zip_code: zipCode,
                reference_point: complement,
              },
              managing_partners: [
                {
                  name: name,
                  document: cpf,
                  email: spaceOrProfessional.email,
                  birthdate: birthday,
                  monthly_income: 10000,
                  professional_occupation: "Autonomo",
                  self_declared_legal_representative: true,
                  phone_numbers: phoneNumbers,
                  address: {
                    street: address,
                    complementary: complement,
                    street_number: number,
                    neighborhood: neighborhood,
                    city: city,
                    state: state,
                    zip_code: zipCode,
                    reference_point: complement,
                  },
                },
              ],
              phone_numbers: phoneNumbers,
            },
            default_bank_account: {
              holder_name: company_name,
              holder_type: userTypeBank,
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
          }
        : {
            register_information: {
              name: name,
              email: spaceOrProfessional.email,
              description: "",
              document: user.cpfOrCnpj,
              type: userType,
              birthdate: birthday,
              monthly_income: 10000,
              professional_occupation: "Autonomo",
              phone_numbers: phoneNumbers,
              address: {
                street: address,
                complementary: complement,
                street_number: number,
                neighborhood: neighborhood,
                city: city,
                state: state,
                zip_code: zipCode,
                reference_point: complement,
              },
            },
            default_bank_account: {
              holder_name: name,
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
          };

    await api
      .post("/recipients", objectRecipient)
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
