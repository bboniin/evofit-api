"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetPaymentService = void 0;
var _api = _interopRequireDefault(require("../../config/api"));
var _prisma = _interopRequireDefault(require("../../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class GetPaymentService {
  async execute({
    paymentId
  }) {
    const payment = await _prisma.default.payment.findUnique({
      where: {
        id: paymentId
      },
      include: {
        space: true,
        professional: true,
        client: true,
        items: true
      }
    });
    let recipient = {};
    await _api.default.get(`/orders/${payment.orderId}`).then(response => {
      recipient = response.data;
    }).catch(e => {
      throw new Error("Ocorreu um erro ao obter informações do pedido");
    });
    payment["order"] = recipient;
    if (!payment) {
      throw new Error("Pagamento não encontrado");
    }
    return payment;
  }
}
exports.GetPaymentService = GetPaymentService;