import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, userSocketMap } from "../index.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.userId;
        const receiverId = req.params.receiverId;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message text cannot be empty" });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: "You cannot message yourself" });
        }

        const senderUser = await User.findById(senderId);
        if (!senderUser || !senderUser.connection.some(id => id.toString() === receiverId.toString())) {
            return res.status(403).json({ message: "You must be connected with this user to send messages" });
        }

        const createdMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            message: message.trim()
        });

        const populatedMessage = await createdMessage.populate([
            { path: "sender", select: "firstName lastName userName profileImage headline" },
            { path: "receiver", select: "firstName lastName userName profileImage headline" }
        ]);

        const receiverSocketId = userSocketMap.get(receiverId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
        }

        return res.status(201).json(populatedMessage);
    } catch (error) {
        return res.status(500).json({ message: `Send message error: ${error.message}` });
    }
};

export const getMessages = async (req, res) => {
    try {
        const myId = req.userId;
        const otherUserId = req.params.receiverId;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: otherUserId },
                { sender: otherUserId, receiver: myId }
            ]
        })
        .populate("sender", "firstName lastName userName profileImage headline")
        .populate("receiver", "firstName lastName userName profileImage headline")
        .sort({ createdAt: 1 })
        .lean();

        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ message: `Get messages error: ${error.message}` });
    }
};

export const getUnreadMessageCount = async (req, res) => {
    try {
        const myId = req.userId;
        const count = await Message.countDocuments({
            receiver: myId,
            seen: false
        });
        return res.status(200).json({ count });
    } catch (error) {
        return res.status(500).json({ message: `Unread count error: ${error.message}` });
    }
};

export const markMessagesAsSeen = async (req, res) => {
    try {
        const myId = req.userId;
        const senderId = req.params.senderId;

        await Message.updateMany(
            { sender: senderId, receiver: myId, seen: false },
            { $set: { seen: true } }
        );

        return res.status(200).json({ message: "Messages marked as seen" });
    } catch (error) {
        return res.status(500).json({ message: `Mark seen error: ${error.message}` });
    }
};

export const getRecentConversations = async (req, res) => {
    try {
        const myId = req.userId;
        const currentUser = await User.findById(myId).populate("connection", "firstName lastName userName profileImage headline").lean();

        const conversations = await Promise.all(
            (currentUser.connection || []).map(async (connUser) => {
                const lastMsg = await Message.findOne({
                    $or: [
                        { sender: myId, receiver: connUser._id },
                        { sender: connUser._id, receiver: myId }
                    ]
                }).sort({ createdAt: -1 }).lean();

                const unreadCount = await Message.countDocuments({
                    sender: connUser._id,
                    receiver: myId,
                    seen: false
                });

                return {
                    user: connUser,
                    lastMessage: lastMsg ? lastMsg.message : "",
                    lastMessageTime: lastMsg ? lastMsg.createdAt : null,
                    lastMessageSender: lastMsg ? lastMsg.sender : null,
                    unreadCount
                };
            })
        );

        conversations.sort((a, b) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });

        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json({ message: `Get conversations error: ${error.message}` });
    }
};
