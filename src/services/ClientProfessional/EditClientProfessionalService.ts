import { getValue } from "../../config/functions";
import prismaClient from "../../prisma";
import * as OneSignal from "onesignal-node";

interface ClientRequest {
  name: string;
  clientId: string;
  spaceId: string;
  value: number;
  dayDue: number;
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
    dayDue,
    schedule,
  }: ClientRequest) {
    if (
      !name ||
      !clientId ||
      !spaceId ||
      !value ||
      !dayDue ||
      !schedule.length
    ) {
      throw new Error("Todos os campos são obrigatórios");
    }

    let data = {
      name: name,
      spaceId: spaceId,
      value: value,
      dayDue: dayDue,
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

    if (spaceId) {
      const space = await prismaClient.space.findUnique({
        where: {
          id: spaceId,
        },
      });

      if (!space) {
        throw new Error("Academia não encontrada");
      }
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

    return clientProfessional;
  }
}

export { EditClientProfessionalService };
