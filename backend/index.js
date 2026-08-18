import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import postRouter from './routes/post.routes.js';
import connectionRouter from './routes/connection.routes.js';
import http from 'http';
import { Server } from 'socket.io';
import notificationRouter from './routes/notification.routes.js';
import messageRouter from './routes/message.routes.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 5000;

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/message", messageRouter);

export const userSocketMap = new Map();

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register", (userId) => {
        if (userId) {
            userSocketMap.set(userId.toString(), socket.id);
            console.log("Registered user on socket:", userId);
        }
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        for (let [userId, sockId] of userSocketMap.entries()) {
            if (sockId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    });
});

app.get('/', (req, res) => {
    res.send("Conexis API running");
});

server.listen(port, () => {
    connectDb();
    console.log(`Server is running on port ${port}`);
});