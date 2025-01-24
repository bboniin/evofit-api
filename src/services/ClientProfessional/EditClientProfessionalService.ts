import { getDate } from "date-fns";
import { getValue, validateEmail } from "../../config/functions";
import prismaClient from "../../prisma";
import * as OneSignal from "onesignal-node";

interface ClientRequest {
  name: string;
  clientId: string;
  spaceId: string;
  email: string;
  professionalId: string;
  value: number;
  dayDue: number;
  billingPeriod: string;
  consultancy: boolean;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

class EditClientProfessionalService {
  async execute({
    name,
    clientId,
    spaceId,
    value,
    email,
    professionalId,
    dayDue,
    billingPeriod,
    schedule,
    consultancy,
  }: ClientRequest) {
    if (
      !name ||
      !clientId ||
      (!consultancy && !spaceId) ||
      !value ||
      !email ||
      !dayDue ||
      !schedule.length
    ) {
      throw new Error("Todos os campos são obrigatórios");
    }

    let data = {
      name: name,
      email: email,
      spaceId: !consultancy ? spaceId : null,
      value: value,
      dayDue: dayDue,
      billingPeriod: billingPeriod || "monthly",
      consultancy: consultancy,
    };

    const clientAlreadyExists =
      await prismaClient.clientsProfessional.findFirst({
        where: {
          id: clientId,
        },
      });

    if (!clientAlreadyExists) {
      throw new Error("Cliente não encontrado");
    }

    if (
      clientAlreadyExists.email != email &&
      clientAlreadyExists.status == "registration_pending"
    ) {
      if (!validateEmail(email)) {
        throw new Error("Email inválido");
      }

      const userAlreadyExists = await prismaClient.user.findFirst({
        where: {
          email: email,
          OR: [
            {
              role: "PROFESSIONAL",
            },
            {
              role: "SPACE",
            },
          ],
        },
      });

      if (userAlreadyExists) {
        throw new Error("Email já está sendo usado por outro tipo de usuário");
      }

      const clientAlreadyExists =
        await prismaClient.clientsProfessional.findFirst({
          where: {
            email: email,
            professionalId: professionalId,
            status: {
              not: "cancelled",
            },
          },
        });

      if (clientAlreadyExists) {
        throw new Error("Você já cadastrou um aluno usando esse email");
      }
    }

    if (spaceId) {
      const space = await prismaClient.space.findUnique({
        where: {
          id: spaceId,
          isDeleted: false,
        },
      });

      if (!space) {
        throw new Error("Espaço não encontrado");
      }
    }

    const day = getDate(new Date());

    if (dayDue != clientAlreadyExists.dayDue && dayDue >= day) {
      data["status"] = "active";
    }

    const clientProfessional = await prismaClient.clientsProfessional.update({
      where: {
        id: clientId,
      },
      data: data,
      include: {
        schedules: true,
        professional: true,
      },
    });

    if (
      clientProfessional.clientId &&
      clientProfessional.status != "registration_pending"
    ) {
      const client = new OneSignal.Client(
        "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
        "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
      );
      if (clientProfessional.value != clientAlreadyExists.value) {
        await client.createNotification({
          headings: {
            en: "Valor da Mensalidade Alterado",
            pt: "Valor da Mensalidade Alterado",
          },
          contents: {
            en: `${clientProfessional.professional.name.toUpperCase()} alterou o valor da mensalidade para ${getValue(
              clientProfessional.value
            )}`,
            pt: `${clientProfessional.professional.name.toUpperCase()} alterou o valor da mensalidade para ${getValue(
              clientProfessional.value
            )}`,
          },
          data: {
            screen: "ClientSchedule",
            params: {
              id: clientProfessional.id,
            },
          },
          include_external_user_ids: [clientProfessional.clientId],
        });

        await prismaClient.notification.create({
          data: {
            title: "Data de Vencimento Alterada",
            message: `${clientProfessional.professional.name.toUpperCase()} alterou seu vencimento mensal para o dia ${
              clientProfessional.dayDue
            }`,
            type: "ClientSchedule",
            dataId: clientProfessional.id,
            userId: clientProfessional.clientId,
          },
        });
      }
      if (clientProfessional.dayDue != clientAlreadyExists.dayDue) {
        await client.createNotification({
          headings: {
            en: "Data de Vencimento Alterada",
            pt: "Data de Vencimento Alterada",
          },
          contents: {
            en: `${clientProfessional.professional.name.toUpperCase()} alterou seu vencimento mensal para o dia ${
              clientProfessional.dayDue
            }`,
            pt: `${clientProfessional.professional.name.toUpperCase()} alterou seu vencimento mensal para o dia ${
              clientProfessional.dayDue
            }`,
          },
          data: {
            screen: "ClientSchedule",
            params: {
              id: clientProfessional.id,
            },
          },
          include_external_user_ids: [clientProfessional.clientId],
        });

        await prismaClient.notification.create({
          data: {
            title: "Data de Vencimento Alterada",
            message: `${clientProfessional.professional.name.toUpperCase()} alterou seu vencimento mensal para o dia ${
              clientProfessional.dayDue
            }`,
            type: "ClientSchedule",
            dataId: clientProfessional.id,
            userId: clientProfessional.clientId,
          },
        });
      }
    }

    const arraysDelete = clientProfessional.schedules.filter(
      (item) =>
        schedule.findIndex((data) => data.dayOfWeek == item.dayOfWeek) == -1
    );

    await Promise.all(
      arraysDelete.map(
        async (item) =>
          await prismaClient.schedule.delete({
            where: {
              id: item.id,
            },
          })
      )
    );
    await Promise.all(
      schedule.map(async (item) => {
        const scheduleDay = await prismaClient.schedule.findUnique({
          where: {
            professionalId_clientProfessionalId_dayOfWeek: {
              professionalId: clientProfessional.professionalId,
              clientProfessionalId: clientProfessional.id,
              dayOfWeek: item.dayOfWeek,
            },
          },
        });

        if (scheduleDay) {
          await prismaClient.schedule.update({
            where: {
              id: scheduleDay.id,
            },
            data: {
              startTime: item.startTime,
              endTime: item.endTime,
            },
          });
        } else {
          await prismaClient.schedule.create({
            data: {
              professionalId: clientProfessional.professionalId,
              clientProfessionalId: clientProfessional.id,
              dayOfWeek: item.dayOfWeek,
              startTime: item.startTime,
              endTime: item.endTime,
              recurring: true,
              isBlock: false,
              date: new Date(),
            },
          });
        }
      })
    );

    if (consultancy) {
      await prismaClient.schedule.deleteMany({
        where: {
          professionalId: clientProfessional.professionalId,
          clientProfessionalId: clientProfessional.id,
        },
      });
    }

    return clientProfessional;
  }
}

export { EditClientProfessionalService };
