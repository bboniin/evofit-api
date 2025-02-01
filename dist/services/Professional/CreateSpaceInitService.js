"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateSpaceInitService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _S3Storage = _interopRequireDefault(require("../../utils/S3Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CreateSpaceInitService {
  async execute({
    userId,
    name,
    latitude,
    schedule,
    longitude,
    photo,
    description,
    city,
    state,
    neighborhood,
    number,
    address,
    zipCode,
    complement
  }) {
    if (!name || !latitude || !longitude) {
      throw new Error("Todos os campos são obrigatórios");
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
      complement: complement,
      userId: null
    };
    if (photo) {
      const s3Storage = new _S3Storage.default();
      const upload = await s3Storage.saveFile(photo);
      data["photo"] = upload;
    }
    const space = await _prisma.default.space.create({
      data: userId ? {
        ...data,
        professionals: {
          create: {
            professionalId: userId
          }
        }
      } : data
    });
    if (schedule) {
      Promise.all(await schedule.map(async item => {
        await _prisma.default.spaceHours.create({
          data: {
            spaceId: space.id,
            dayOfWeek: Number(item.dayOfWeek),
            startTime: item.startTime,
            endTime: item.endTime
          }
        });
      }));
    }
    return space;
  }
}
exports.CreateSpaceInitService = CreateSpaceInitService;