import uploadoOnCloudinary from "../config/cloudinary.js";
import { io, userSocketMap } from "../index.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
    try {
        let { description } = req.body;
        let newPost;
        if (req.file) {
            let image = await uploadoOnCloudinary(req.file.path);
            newPost = await Post.create({ author: req.userId, description, image });
        } else {
            newPost = await Post.create({ author: req.userId, description });
        }

        // Populate author details so frontend can render it immediately without reload
        let populatedPost = await Post.findById(newPost._id)
            .populate("author", "firstName lastName headline profileImage userName")
            .populate("comment.user", "firstName lastName profileImage");

        // Broadcast to all connected clients
        io.emit("newPostCreated", populatedPost);

        return res.status(201).json(populatedPost);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "create post error" });
    }
};

export const getPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "firstName lastName headline profileImage userName")
            .populate("comment.user", "firstName lastName profileImage")
            .sort({ createdAt: -1 });
        return res.status(200).json(posts);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "get post error" });
    }
};

export const like = async (req, res) => {
    try {
        let postId = req.params.id;
        let userId = req.userId;
        let post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({ message: "post not found" });
        }
        if (post.like.includes(userId)) {
            post.like = post.like.filter(id => id != userId);
        } else {
            post.like.push(userId);
            if (post.author != userId) {
                let notification = await Notification.create({
                    receiver: post.author,
                    type: "like",
                    relatedUser: userId,
                    relatedPost: postId
                });

                let receiverSocketId = userSocketMap.get(post.author.toString());
                if (receiverSocketId) {
                    let populatedNotif = await Notification.findById(notification._id)
                        .populate("relatedUser", "firstName lastName profileImage")
                        .populate("relatedPost", "image description");
                    io.to(receiverSocketId).emit("newNotification", populatedNotif);
                }
            }
        }
        await post.save();
        io.emit("likeUpdated", { postId, likes: post.like });
        return res.status(200).json(post);
    } catch (error) {
        return res.status(400).json({ message: `like error ${error.message}` });
    }
};

export const comment = async (req, res) => {
    try {
        let postId = req.params.id;
        let userId = req.userId;
        let { content } = req.body;
        let post = await Post.findByIdAndUpdate(postId, {
            $push: { comment: { content, user: userId } }
        }, { new: true }).populate("comment.user", "firstName lastName profileImage headline");
        
        if (!post) {
            return res.status(400).json({ message: "post not found" });
        }

        if (post.author != userId) {
            let notification = await Notification.create({
                receiver: post.author,
                type: "comment",
                relatedUser: userId,
                relatedPost: postId
            });

            let receiverSocketId = userSocketMap.get(post.author.toString());
            if (receiverSocketId) {
                let populatedNotif = await Notification.findById(notification._id)
                    .populate("relatedUser", "firstName lastName profileImage")
                    .populate("relatedPost", "image description");
                io.to(receiverSocketId).emit("newNotification", populatedNotif);
            }
        }

        io.emit("commentAdded", { postId, comment: post.comment });
        return res.status(200).json(post);
    } catch (error) {
        return res.status(400).json({ message: `comment error ${error.message}` });
    }
};