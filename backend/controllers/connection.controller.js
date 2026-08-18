import Connection from '../models/connection.model.js';
import User from '../models/user.model.js';
import { io, userSocketMap } from '../index.js';
import Notification from '../models/notification.model.js';

export const sendConnection = async (req, res) => {
    try {
        let id = req.params.id;
        let senderId = req.userId;
        let user = await User.findById(senderId);
        if (senderId == id) {
            return res.status(400).json({ message: "you can't send connection request to yourself" });
        }
        if (user.connection.includes(id)) {
            return res.status(400).json({ message: "you are already connected" });
        }
        let existingRequest = await Connection.findOne({
            sender: senderId,
            receiver: id,
            status: "pending"
        });
        if (existingRequest) {
            return res.status(400).json({ message: "you have already sent a connection request to this user" });
        }
        let newRequest = await Connection.create({
            sender: senderId,
            receiver: id
        });

        let populatedRequest = await Connection.findById(newRequest._id)
            .populate("sender", "firstName lastName email userName profileImage headline");

        let receiverSocketId = userSocketMap.get(id);
        let senderSocketId = userSocketMap.get(senderId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("statusUpdate", { updatedUserId: senderId, newStatus: "received" });
            io.to(receiverSocketId).emit("newConnectionRequest", populatedRequest);
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("statusUpdate", { updatedUserId: id, newStatus: "pending" });
        }

        return res.status(201).json(populatedRequest);
    } catch (error) {
        return res.status(500).json({ message: `Connection Send Error : ${error.message}` });
    }
};

export const acceptConnection = async (req, res) => {
    try {
        let connectionId = req.params.connectionId;
        let connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({ message: "Connection not found" });
        }
        if (connection.status !== "pending") {
            return res.status(400).json({ message: "Connection Under Process" });
        }
        connection.status = "accepted";
        await connection.save();

        let notification = await Notification.create({
            receiver: connection.sender,
            type: "connectionAccepted",
            relatedUser: req.userId,
        });

        await User.findByIdAndUpdate(connection.sender._id, {
            $addToSet: { connection: req.userId }
        });
        await User.findByIdAndUpdate(req.userId, {
            $addToSet: { connection: connection.sender._id }
        });

        let receiverSocketId = userSocketMap.get(connection.receiver._id.toString());
        let senderSocketId = userSocketMap.get(connection.sender._id.toString());

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("statusUpdate", { updatedUserId: connection.sender._id, newStatus: "disconnect" });
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("statusUpdate", { updatedUserId: req.userId, newStatus: "disconnect" });
            
            let populatedNotif = await Notification.findById(notification._id)
                .populate("relatedUser", "firstName lastName profileImage");
            io.to(senderSocketId).emit("newNotification", populatedNotif);
        }

        return res.status(200).json({ message: "Connection accepted" });

    } catch (error) {
        return res.status(500).json({ message: `Connection Accept Error : ${error.message}` });
    }
};

export const rejectConnection = async (req, res) => {
    try {
        let connectionId = req.params.connectionId;
        let connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({ message: "Connection not found" });
        }
        if (connection.status !== "pending") {
            return res.status(400).json({ message: "Connection Under Process" });
        }
        connection.status = "rejected";
        await connection.save();

        return res.status(200).json({ message: "Connection rejected" });

    } catch (error) {
        return res.status(500).json({ message: `Connection Reject Error : ${error.message}` });
    }
};

export const getConnections = async (req, res) => {
    try {
        let targetUserId = req.params.userId;
        let currentUserId = req.userId;
        let currentUser = await User.findById(currentUserId);
        if (currentUser.connection.includes(targetUserId)) {
            return res.json({ status: "disconnect" });
        }
        const pendingRequest = await Connection.findOne({
            $or: [
                { sender: currentUserId, receiver: targetUserId },
                { sender: targetUserId, receiver: currentUserId }
            ],
            status: "pending"
        });
        if (pendingRequest) {
            if (pendingRequest.sender.toString() === currentUserId.toString()) {
                return res.json({ status: "pending" });
            } else {
                return res.json({ status: "received", requestId: pendingRequest._id });
            }
        }
        return res.json({ status: "Connect" });

    } catch (error) {
        return res.status(500).json({ message: `Get Connection Error : ${error.message}` });
    }
};

export const removeConnection = async (req, res) => {
    try {
        let myId = req.userId;
        let otherUserId = req.params.userId;
        await User.findByIdAndUpdate(myId, {
            $pull: { connection: otherUserId }
        });
        await User.findByIdAndUpdate(otherUserId, {
            $pull: { connection: myId }
        });

        let receiverSocketId = userSocketMap.get(otherUserId);
        let senderSocketId = userSocketMap.get(myId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("statusUpdate", { updatedUserId: myId, newStatus: "connect" });
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("statusUpdate", { updatedUserId: otherUserId, newStatus: "connect" });
        }

        return res.status(200).json({ message: "Connection removed" });
    } catch (error) {
        return res.status(500).json({ message: `Remove Connection Error : ${error.message}` });
    }
};

export const getConnectionRequests = async (req, res) => {
    try {
        const userId = req.userId;
        const request = await Connection.find({ receiver: userId, status: "pending" })
            .populate("sender", "firstName lastName email userName profileImage headline");
        return res.status(200).json(request);
    } catch (error) {
        return res.status(500).json({ message: `Get All Connections Error : ${error.message}` });
    }
};

export const getUserConnections = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId)
            .populate("connection", "firstName lastName email userName profileImage headline connection");
        return res.status(200).json(user.connection);
    } catch (error) {
        return res.status(500).json({ message: `Get User Connections Error : ${error.message}` });
    }
};
