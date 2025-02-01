"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BlocksScheduleProfessionalService = void 0;
var _dateFns = require("date-fns");
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class BlocksScheduleProfessionalService {
  async execute({
    professionalId
  }) {
    const blocks = await _prisma.default.schedule.findMany({
      where: {
        professionalId,
        isBlock: true,
        recurring: false,
        date: {
          gte: (0, _dateFns.startOfDay)(new Date())
        }
      }
    });
    const blocksRecurring = await _prisma.default.schedule.findMany({
      where: {
        professionalId,
        isBlock: true,
        recurring: true
      }
    });
    const blocksRecurringOrder = blocksRecurring.sort((a, b) => a.startTime.localeCompare(b.startTime));
    const blocksOrder = blocks.sort((a, b) => a.startTime.localeCompare(b.startTime)).sort((a, b) => {
      const dateA = new Date(a.date); // Converte para objeto Date
      const dateB = new Date(b.date);
      const dateComparison = dateA.getTime() - dateB.getTime(); // Subtrai os timestamps

      if (dateComparison === 0) {
        return a.startTime.localeCompare(b.startTime); // Ordena por startTime se as datas forem iguais
      }
      return dateComparison;
    });
    return {
      blocks: blocksOrder,
      blocksRecurring: blocksRecurringOrder
    };
  }
}
exports.BlocksScheduleProfessionalService = BlocksScheduleProfessionalService;