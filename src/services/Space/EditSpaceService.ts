import prismaClient from "../../prisma";
import S3Storage from "../../utils/S3Storage";

interface SpaceRequest {
  name: string;
  photo: string;
  phoneNumber: string;
  email: string;
  userId: string;
  description: string;
  latitude: number;
  longitude: number;
  valueDiarie: number;
  enableDiarie: boolean;
  city: string;
  state: string;
  zipCode: string;
  number: string;
  complement: string;
  address: string;
  type: string;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    id: string;
  }>;
}

class EditSpaceService {
  async execute({
    name,
    city,
    type,
    state,
    enableDiarie,
    valueDiarie,
    zipCode,
    address,
    number,
    complement,
    phoneNumber,
    latitude,
    longitude,
    description,
    photo,
    email,
    schedule,
    userId,
  }: SpaceRequest) {
    let data = {};

    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
        role: "SPACE",
      },
      include: {
        space: {
          where: {
            isDeleted: false,
          },
          include: {
            spaceHours: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const userData = {
      email: user.email,
      ...user.space,
    };

    if (type == "account") {
      if (email) {
        const userAlreadyExists = await prismaClient.user.findFirst({
          where: {
            email: email,
          },
        });

        if (userAlreadyExists) {
          if (userAlreadyExists.id != userId) {
            throw new Error("Email já cadastrado");
          }
        }
      }
      data = {
        name: name || userData.name,
        phoneNumber: phoneNumber || userData.phoneNumber,
      };
    }

    if (type == "profile") {
      if (!description || (!photo && !userData.photo)) {
        throw new Error("Foto de perfil e descrição são obrigatórios");
      }
      data = {
        description: description || userData.description,
        finishProfile: true,
      };
    }

    if (type == "bank") {
      if (!enableDiarie || !valueDiarie) {
        throw new Error("Ative a Diaria e preencha todos os campos");
      }
      data = {
        valueDiarie: valueDiarie,
        enableDiarie: enableDiarie,
      };
    }

    if (type == "address") {
      if (
        !latitude ||
        !longitude ||
        !state ||
        !city ||
        !zipCode ||
        !number ||
        !address
      ) {
        throw new Error("Preencha todos os campos obrigatórios");
      }
      data = {
        latitude: latitude,
        longitude: longitude,
        state: state,
        city: city,
        zipCode: zipCode,
        number: number,
        complement: complement,
        address: address,
      };
    }

    if (type == "time") {
      if (!schedule.length) {
        throw new Error("Adicione pelo menos um dia de funcionamento");
      }

      Promise.all(
        await userData.spaceHours.map(async (item) => {
          if (!schedule.some((data) => data.id == item.id)) {
            await prismaClient.spaceHours.delete({
              where: {
                id: item.id,
              },
            });
            schedule = schedule.filter((data) => data.id != item.id);
          }
        })
      );

      await Promise.all(
        await schedule.map(async (item) => {
          if (item.id) {
            await prismaClient.spaceHours.update({
              where: {
                id: item.id,
              },
              data: {
                startTime: item.startTime,
                endTime: item.endTime,
              },
            });
          } else {
            await prismaClient.spaceHours.create({
              data: {
                spaceId: userId,
                dayOfWeek: Number(item.dayOfWeek),
                startTime: item.startTime,
                endTime: item.endTime,
              },
            });
          }
        })
      );
    }

    if (photo) {
      const s3Storage = new S3Storage();

      const upload = await s3Storage.saveFile(photo);

      data["photo"] = upload;

      if (userData.photo) {
        await s3Storage.deleteFile(userData.photo);
      }
    }

    const userEdit = await prismaClient.space.update({
      where: {
        userId: userId,
      },
      data: data,
      include: {
        spaceHours: true,
      },
    });

    if (email && email != userData.email) {
      await prismaClient.user.update({
        where: {
          id: userId,
        },
        data: {
          email: email,
        },
      });
    }

    return {
      role: user.role,
      email: email || user.email,
      ...userEdit,
    };
  }
}

export { EditSpaceService };
