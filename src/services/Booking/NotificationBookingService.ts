import * as OneSignal from "onesignal-node";
import prismaClient from "../../prisma";
import { endOfDay, startOfDay } from "date-fns";

const client = new OneSignal.Client(
  "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
  "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
);

async function sendNotification(title, text, userId, dataId, type) {
  await client.createNotification({
    headings: {
      en: title,
      pt: title,
    },
    contents: {
      en: text,
      pt: text,
    },
    data: {
      screen: type,
      params: {
        id: dataId,
      },
    },
    include_external_user_ids: [userId],
  });

  await prismaClient.notification.create({
    data: {
      title: title,
      message: text,
      type: type,
      dataId: dataId,
      userId: userId,
    },
  });
}

class NotificationBookingService {
  async execute() {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

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

    const bookings = await prismaClient.booking.findMany({
      where: {
        status: "confirmed",
        OR: [
          {
            startTime: in15Minutes,
          },
          {
            startTime: in1Hour,
          },
          {
            startTime: in3Hours,
          },
        ],
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        client: true,
      },
    });

    const clientOneSignal = new OneSignal.Client(
      "15ee78c4-6dab-4cb5-a606-1bb5b12170e1",
      "OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw"
    );

    await Promise.all(
      bookings.map(async (booking) => {
        if (booking.startTime == in15Minutes) {
          await sendNotification(
            "Lembrete!",
            `Você tem uma aula hoje as ${booking.startTime}.`,
            booking.clientId,
            booking.id,
            "BookingClient"
          );
          await sendNotification(
            "Aula!",
            `${booking.client.name.toUpperCase()} as ${booking.startTime}.`,
            booking.professionalId,
            booking.id,
            "BookingProfessional"
          );
        } else {
          if (booking.startTime == in1Hour) {
            await sendNotification(
              "Lembrete!",
              `Você tem uma aula hoje as ${booking.startTime}.`,
              [booking.clientId],
              booking,
              "BookingClient"
            );
            await sendNotification(
              "Aula!",
              `${booking.client.name.toUpperCase()} as ${booking.startTime}.`,
              booking.professionalId,
              booking.id,
              "BookingProfessional"
            );
          } else {
            await sendNotification(
              "Lembrete!",
              `Você tem uma aula hoje as ${booking.startTime}.`,
              booking.clientId,
              booking.id,
              "BookingClient"
            );
          }
        }
      })
    );
  }
}

export { NotificationBookingService };
