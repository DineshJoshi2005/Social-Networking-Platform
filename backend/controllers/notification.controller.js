import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        let notification = await Notification.find({ receiver: req.userId })
            .populate("relatedUser", "firstName lastName userName profileImage")
            .populate("relatedPost", "image description")
            .sort({ createdAt: -1 });
        return res.status(200).json(notification);
    } catch (error) {
        return res.status(500).json({ message: `get notification error ${error}` });
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            receiver: req.userId,
            isRead: false
        });
        return res.status(200).json({ count });
    } catch (error) {
        return res.status(500).json({ message: `get unread notification count error ${error}` });
    }
};

export const markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { receiver: req.userId, isRead: false },
            { $set: { isRead: true } }
        );
        return res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ message: `mark read error ${error}` });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        let { id } = req.params;
        await Notification.findOneAndDelete({
            _id: id,
            receiver: req.userId
        });
        return res.status(200).json({ message: "notification deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `delete notification error ${error}` });
    }
};

export const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({
            receiver: req.userId
        });
        return res.status(200).json({ message: "notifications deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `delete all notification error ${error}` });
    }
};