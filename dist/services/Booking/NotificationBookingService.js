"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationBookingService = void 0;
var OneSignal = _interopRequireWildcard(require("onesignal-node"));
var _prisma = _interopRequireDefault(require("../../prisma"));
var _dateFns = require("date-fns");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const client = new OneSignal.Client("15ee78c4-6dab-4cb5-a606-1bb5b12170e1", "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw");
async function sendNotification(title, text, userId, dataId, type) {
  await client.createNotification({
    headings: {
      en: title,
      pt: title
    },
    contents: {
      en: text,
      pt: text
    },
    data: {
      screen: type,
      params: {
        id: dataId
      }
    },
    include_external_user_ids: [userId]
  });
  await _prisma.default.notification.create({
    data: {
      title: title,
      message: text,
      type: type,
      dataId: dataId,
      userId: userId
    }
  });
}
class NotificationBookingService {
  async execute() {
    const todayStart = (0, _dateFns.startOfDay)(new Date());
    const todayEnd = (0, _dateFns.endOfDay)(new Date());
    const hour = new Date().getTime();
    function formatTime(date) {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    const in15Minutes = formatTime(new Date(hour + 15 * 60 * 1000));
    const in1Hour = formatTime(new Date(hour + 1 * 60 * 60 * 1000));
    const in3Hours = formatTime(new Date(hour + 3 * 60 * 60 * 1000));
    console.log(hour, in15Minutes, in1Hour, in3Hours);
    const bookings = await _prisma.default.booking.findMany({
      where: {
        status: "confirmed",
        OR: [{
          startTime: in15Minutes
        }, {
          startTime: in1Hour
        }, {
          startTime: in3Hours
        }],
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        client: true
      }
    });
    const clientOneSignal = new OneSignal.Client("15ee78c4-6dab-4cb5-a606-1bb5b12170e1", "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw");
    await Promise.all(bookings.map(async booking => {
      if (booking.startTime == in15Minutes) {
        await sendNotification("Lembrete!", `Você tem uma aula hoje as ${booking.startTime}.`, booking.clientId, booking.id, "BookingClient");
        await sendNotification("Aula!", `${booking.client.name.toUpperCase()} as ${booking.startTime}.`, booking.professionalId, booking.id, "BookingProfessional");
      } else {
        if (booking.startTime == in1Hour) {
          await sendNotification("Lembrete!", `Você tem uma aula hoje as ${booking.startTime}.`, [booking.clientId], booking, "BookingClient");
          await sendNotification("Aula!", `${booking.client.name.toUpperCase()} as ${booking.startTime}.`, booking.professionalId, booking.id, "BookingProfessional");
        } else {
          await sendNotification("Lembrete!", `Você tem uma aula hoje as ${booking.startTime}.`, booking.clientId, booking.id, "BookingClient");
        }
      }
    }));
  }
}
exports.NotificationBookingService = NotificationBookingService;