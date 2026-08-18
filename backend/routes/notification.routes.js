import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { 
    clearAllNotifications, 
    deleteNotification, 
    getNotifications,
    getUnreadNotificationCount,
    markNotificationsRead
} from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/get", isAuth, getNotifications);
notificationRouter.get("/unread-count", isAuth, getUnreadNotificationCount);
notificationRouter.put("/mark-read", isAuth, markNotificationsRead);
notificationRouter.delete("/deleteone/:id", isAuth, deleteNotification);
notificationRouter.delete("/", isAuth, clearAllNotifications);

export default notificationRouter;