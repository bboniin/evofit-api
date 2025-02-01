"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditSpaceInitService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class EditSpaceInitService {
  async execute({
    name,
    spaceId,
    schedule,
    latitude,
    city,
    state,
    neighborhood,
    number,
    address,
    zipCode,
    complement,
    longitude,
    photo,
    description
  }) {
    const space = await _prisma.default.space.findUnique({
      where: {
        id: spaceId,
        isDeleted: false
      },
      include: {
        spaceHours: true
      }
    });
    if (!space) {
      throw new Error("Espaço não encontrado");
    }
    if (!name || !latitude || !longitude) {
      throw new Error("Nome, Latitude e Longitude são obrigatórios");
    }
    let data = {
      name: name,
      latitude: latitude,
      longitude: longitude,
      description: description,
      city: city,
      state: state,
      zipCode: zipCode,
      neighborhood: neighborhood,
      address: address,
      number: number,
      complement: complement
    };
    if (schedule.length) {
      Promise.all(await space.spaceHours.map(async item => {
        if (!schedule.some(data => data.id == item.id)) {
          await _prisma.default.spaceHours.delete({
            where: {
              id: item.id
            }
          });
          schedule = schedule.filter(data => data.id != item.id);
        }
      }));
      await Promise.all(await schedule.map(async item => {
        if (item.id) {
          await _prisma.default.spaceHours.update({
            where: {
              id: item.id
            },
            data: {
              startTime: item.startTime,
              endTime: item.endTime
            }
          });
        } else {
          await _prisma.default.spaceHours.create({
            data: {
              spaceId: space.id,
              dayOfWeek: Number(item.dayOfWeek),
              startTime: item.startTime,
              endTime: item.endTime
            }
          });
        }
      }));
    }
    if (photo) {
      const s3Storage = new _S3Storage.default();
      const upload = await s3Storage.saveFile(photo);
      data["photo"] = upload;
      if (space.photo) {
        await s3Storage.deleteFile(space.photo);
      }
    }
    const spaceEdit = await _prisma.default.space.update({
      where: {
        id: spaceId
      },
      data,
      include: {
        spaceHours: true
      }
    });
    return spaceEdit;
  }
}
exports.EditSpaceInitService = EditSpaceInitService;