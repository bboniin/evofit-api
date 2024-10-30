import express, { Request, Response, NextFunction } from "express";
import 'express-async-errors'
import cors from 'cors'
import http from 'http';
import { Server } from 'socket.io';
import { router } from "./routes";
import { verify } from 'jsonwebtoken'
import authConfig from "./utils/auth"
import prismaClient from "./prisma";
import { SendMessageService } from "./services/Chat/SendMessageService";
import { SendNotificationService } from "./services/Chat/SendNotificationService";

interface Payload {
    sub: string;
}

const app = express()

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Permite todas as origens (ajuste conforme necessário)
        methods: ['GET', 'POST']
    }
});


app.use(express.json())

app.use(cors());

app.use(router)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Error) {
        return res.status(400).json({ message: err.message })
    }
    return res.status(500).json({
        status: 'error',
        message: 'Internal serve error'
    })
})

const connectedUsers = {};

io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;

    socket.data.userId = userId;

    if(!connectedUsers[userId]){
       connectedUsers[userId] = socket.id; 
    }
    
    next();
});

io.on('connection', (socket) => {
    const { userId } = socket.data;

    socket.on('sendMessage', async (data) => {
        const { recipientId, content, userType } = data;

        const sendMessageService = new SendMessageService();
        const message = await sendMessageService.execute({
            recipientId, userType, content, userId: userId
        });

        if (connectedUsers[recipientId]) {
            const recipientSocketId = connectedUsers[recipientId];
            io.to(recipientSocketId).emit('newMessage', message);
        } else {
            const sendNotificaionService = new SendNotificationService();
            await sendNotificaionService.execute({
                message, recipientId
            })
        }
    });

    socket.on('disconnect', () => {
        const userId = socket.data.userId;
        delete connectedUsers[userId];
    });
});


server.listen(3333, () => {
    console.log(`rodando v1.0.41`)
}) 