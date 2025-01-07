import { hash } from "bcryptjs";
import prismaClient from "../../prisma";
import { sign } from "jsonwebtoken";
import authConfig from "../../utils/auth";
import api from "../../config/api";
import { addDays, addMinutes } from "date-fns";
import {
  validateCpf,
  validateEmail,
  validatePhone,
} from "../../config/functions";

interface ClientRequest {
  name: string;
  photo: string;
  phoneNumber: string;
  email: string;
  cpf: string;
  birthday: Date;
  password: string;
  objective: string;
  experienceLevel: string;
}

class CreateClientService {
  async execute({
    name,
    password,
    birthday,
    phoneNumber,
    cpf,
    objective,
    experienceLevel,
    email,
  }: ClientRequest) {
    if (
      !name ||
      !phoneNumber ||
      !password ||
      !cpf ||
      !objective ||
      !experienceLevel ||
      !email ||
      !birthday
    ) {
      throw new Error("Preencha todos os campos obrigatórios");
    }

    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    if (userAlreadyExists) {
      throw new Error("Email já cadastrado");
    }

    const cpfString = cpf.replace(/\D/g, "");

    if (!validateCpf(cpfString)) {
      throw new Error("CPF inválido");
    }

    if (!validateEmail(email)) {
      throw new Error("Email inválido");
    }

    if (!validatePhone(phoneNumber)) {
      throw new Error("Telefone inválido");
    }

    const passwordHash = await hash(password, 8);

    let data = {
      name: name,
      birthday: new Date(birthday),
      phoneNumber: phoneNumber,
      cpf: cpfString,
      objective: objective,
      experienceLevel: experienceLevel,
      photo: "",
    };

    const user = await prismaClient.user.create({
      data: {
        email: email,
        password: passwordHash,
        role: "CLIENT",
      },
    });

    const client = await prismaClient.client.create({
      data: {
        id: user.id,
        userId: user.id,
        ...data,
      },
    });

    const clients = await prismaClient.clientsProfessional.findMany({
      where: {
        email: email,
        clientId: null,
      },
    });

    await Promise.all(
      clients.map(async (item) => {
        const clientUp = await prismaClient.clientsProfessional.update({
          where: {
            id: item.id,
          },
          data: {
            clientId: user.id,
            status: "awaiting_payment",
          },
          include: {
            client: {
              include: {
                user: true,
              },
            },
            professional: true,
          },
        });

        const valueClientAll = clientUp.value * 100;
        const valuePaid = valueClientAll * 1.02;

        await api
          .post("/orders", {
            closed: true,
            items: [
              {
                amount: valuePaid,
                description: `Mensalidade ${
                  item.consultancy ? "Consultoria" : "Personal"
                }`,
                quantity: 1,
                code: 1,
              },
            ],
            customer: {
              name: clientUp.client.name,
              type: "individual",
              document: clientUp.client.cpf,
              email: clientUp.client.user.email,
              phones: {
                mobile_phone: {
                  country_code: "55",
                  number: "000000000",
                  area_code: "11",
                },
              },
            },
            payments: [
              {
                payment_method: "pix",
                pix: {
                  expires_in: 259200,
                  additional_information: [
                    {
                      name: "information",
                      value: "number",
                    },
                  ],
                },
                split: [
                  {
                    amount: valueClientAll,
                    recipient_id: clientUp.professional.recipientId,
                    type: "flat",
                    options: {
                      charge_processing_fee: false,
                      charge_remainder_fee: false,
                      liable: false,
                    },
                  },
                  {
                    amount: valuePaid - valueClientAll,
                    recipient_id: "re_cm2uxwdzw3j720m9tiinncic7",
                    type: "flat",
                    options: {
                      charge_processing_fee: true,
                      charge_remainder_fee: true,
                      liable: true,
                    },
                  },
                ],
              },
            ],
          })
          .then(async (response) => {
            await prismaClient.payment.create({
              data: {
                name: `Mensalidade ${
                  clientUp.consultancy ? "Consultoria" : "Personal"
                }`,
                professionalId: clientUp.professionalId,
                clientId: client.id,
                valueUnit: clientUp.value,
                amount: 1,
                type: "RECURRING",
                recurring: true,
                value: valueClientAll / 100,
                rate: (valuePaid - valueClientAll) / 100,
                orderId: response.data.id,
                expireAt: addDays(new Date(), 3),
              },
            });
          })
          .catch((e) => {
            console.log(e.response.data);
            throw new Error("Ocorreu um erro ao criar cobrança");
          });

        return true;
      })
    );

    const token = sign(
      {
        email: user.email,
        role: user.role,
      },
      authConfig.jwt.secret,
      {
        subject: user.id,
        expiresIn: "365d",
      }
    );

    return {
      role: user.role,
      email: user.email,
      token: token,
      ...client,
    };
  }
}

export { CreateClientService };
