import User from "../models/user.model.js";
import uploadoOnCloudinary from './../config/cloudinary.js';
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "get current user error" });
    }
}
export const updateProfile = async (req, res) => {
    try {
        let { firstName, lastName, userName, headline, location, gender} = req.body;
        let skills = req.body.skills ? JSON.parse(req.body.skills) : [];
        let experience = req.body.experience ? JSON.parse(req.body.experience) : [];
        let education = req.body.education ? JSON.parse(req.body.education) : [];
        let profileImage;
        let coverImage;
        if (req.files) {
            if (req.files.profileImage) {
                profileImage = await uploadoOnCloudinary(req.files.profileImage[0].path);
            }
            if (req.files.coverImage) {
                coverImage = await uploadoOnCloudinary(req.files.coverImage[0].path);
            }
            
        }
        let user = await User.findByIdAndUpdate(req.userId, { firstName, lastName, userName, headline, location, gender, skills, education, experience, profileImage, coverImage }, { new: true }).select("-password");
        return res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message });
    }
}

export const getProfile = async (req, res) => {
    try {
        let { userName } = req.params;
        let user = await User.findOne({ userName }).select("-password");
        if (!user) {
            return res.status(400).json({ message: "userName does not exist" })
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `get profile error ${error}` });
    }
}

export const search = async (req, res) => {
    try {
        let { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "Query is required" });

        }
        let users = await User.find({
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { userName: { $regex: query, $options: "i" } },
                { skills: {$in: [query] } }
            ]
        }) 
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: `search error ${error.message}` });
    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        let currentUser = await User.findById(req.userId).select("connection");
        let connections = currentUser?.connection || [];
        let suggestedUsers = await User.find({
            _id: {
                $ne: req.userId,
                $nin: connections
            }
        }).select("-password").limit(10);
        return res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Suggested user error ${error}` });
    }
}