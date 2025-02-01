"use strict";

var _express = _interopRequireDefault(require("express"));
require("express-async-errors");
var _cors = _interopRequireDefault(require("cors"));
var _http = _interopRequireDefault(require("http"));
var _socket = require("socket.io");
var _routes = require("./routes");
var _nodeCron = _interopRequireDefault(require("node-cron"));
var _SendMessageService = require("./services/Chat/SendMessageService");
var _SendNotificationService = require("./services/Chat/SendNotificationService");
var _ExpirePaymentService = require("./services/Payment/ExpirePaymentService");
var _ChargePaymentService = require("./services/ClientProfessional/ChargePaymentService");
var _CreateBookingDayService = require("./services/Booking/CreateBookingDayService");
var _NotificationBookingService = require("./services/Booking/NotificationBookingService");
var _ExpireNotificationsService = require("./services/Notification/ExpireNotificationsService");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const app = (0, _express.default)();
const server = _http.default.createServer(app);
const io = new _socket.Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.use(_express.default.json());
app.use((0, _cors.default)());
app.use(_routes.router);
app.use((err, req, res, next) => {
  if (err instanceof Error) {
    return res.status(400).json({
      message: err.message
    });
  }
  return res.status(500).json({
    status: "error",
    message: "Internal serve error"
  });
});
_nodeCron.default.schedule("* * * * *", () => {
  const expirePaymentService = new _ExpirePaymentService.ExpirePaymentService();
  expirePaymentService.execute();
});
_nodeCron.default.schedule("1 0 * * *", () => {
  const expireNotificationsService = new _ExpireNotificationsService.ExpireNotificationsService();
  expireNotificationsService.execute();
});
_nodeCron.default.schedule("0 0 * * *", () => {
  const chargePaymentService = new _ChargePaymentService.ChargePaymentService();
  chargePaymentService.execute();
});
_nodeCron.default.schedule("0 0 * * *", () => {
  const createBookingDayService = new _CreateBookingDayService.CreateBookingDayService();
  createBookingDayService.execute();
});
_nodeCron.default.schedule("*/15 * * * *", () => {
  const notificationBookingService = new _NotificationBookingService.NotificationBookingService();
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
io.on("connection", socket => {
  const {
    userId
  } = socket.data;
  socket.on("sendMessage", async data => {
    const {
      recipientId,
      content,
      userType
    } = data;
    const sendMessageService = new _SendMessageService.SendMessageService();
    const message = await sendMessageService.execute({
      recipientId,
      userType,
      content,
      userId: userId
    });
    if (connectedUsers[recipientId]) {
      const recipientSocketId = connectedUsers[recipientId];
      io.to(recipientSocketId).emit("newMessage", message);
    } else {
      const sendNotificaionService = new _SendNotificationService.SendNotificationService();
      await sendNotificaionService.execute({
        message,
        recipientId
      });
    }
  });
  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    delete connectedUsers[userId];
  });
});
server.listen(3333, () => {
  console.log(`rodando v1.0.55`);
});