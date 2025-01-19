import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { router } from "./routes";
import cron from "node-cron";
import { SendMessageService } from "./services/Chat/SendMessageService";
import { SendNotificationService } from "./services/Chat/SendNotificationService";
import { ExpirePaymentService } from "./services/Payment/ExpirePaymentService";
import { ChargePaymentService } from "./services/ClientProfessional/ChargePaymentService";
import { CreateBookingDayService } from "./services/Booking/CreateBookingDayService";
import { NotificationBookingService } from "./services/Booking/NotificationBookingService";

interface Payload {
  sub: string;
}

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

app.use(cors());

app.use(router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({
    status: "error",
    message: "Internal serve error",
  });
});

cron.schedule("* * * * *", () => {
  const expirePaymentService = new ExpirePaymentService();
  expirePaymentService.execute();
});

cron.schedule("* * * * *", () => {
  const chargePaymentService = new ChargePaymentService();
  chargePaymentService.execute();
});

cron.schedule("0 0 * * *", () => {
  const createBookingDayService = new CreateBookingDayService();
  createBookingDayService.execute();
});

cron.schedule("*/15 * * * *", () => {
  const notificationBookingService = new NotificationBookingService();
  notificationBookingService.execute();
});

const connectedUsers = {};

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;

  socket.data.userId = userId;

  if (!connectedUsers[userId]) {
    connectedUsers[userId] = socket.id;
  }

  next();
});

io.on("connection", (socket) => {
  const { userId } = socket.data;

  socket.on("sendMessage", async (data) => {
    const { recipientId, content, userType } = data;

    const sendMessageService = new SendMessageService();
    const message = await sendMessageService.execute({
      recipientId,
      userType,
      content,
      userId: userId,
    });

    if (connectedUsers[recipientId]) {
      const recipientSocketId = connectedUsers[recipientId];
      io.to(recipientSocketId).emit("newMessage", message);
    } else {
      const sendNotificaionService = new SendNotificationService();
      await sendNotificaionService.execute({
        message,
        recipientId,
      });
    }
  });

  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    delete connectedUsers[userId];
  });
});

server.listen(3333, () => {
  console.log(`rodando v1.0.5`);
});
