import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { 
    sendMessage, 
    getMessages, 
    getRecentConversations,
    getUnreadMessageCount,
    markMessagesAsSeen
} from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.post("/send/:receiverId", isAuth, sendMessage);
messageRouter.post("/seen/:senderId", isAuth, markMessagesAsSeen);
messageRouter.get("/unread-count", isAuth, getUnreadMessageCount);
messageRouter.get("/conversations", isAuth, getRecentConversations);
messageRouter.get("/:receiverId", isAuth, getMessages);

export default messageRouter;
