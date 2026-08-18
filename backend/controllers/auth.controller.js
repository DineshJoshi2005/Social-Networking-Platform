import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const isProduction = process.env.NODE_ENVIRONMENT === "production";

export const signUp = async (req, res) => {
    try {
        let { firstName, lastName, userName, email, password } = req.body;
        let existEmail = await User.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ message: "Email already exist !" });
        }
        let existUsername = await User.findOne({ userName });
        if (existUsername) {
            return res.status(400).json({ message: "Username already exist !" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must have atleast 8 characters" });
        }

        let hashedPass = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            userName,
            email,
            password: hashedPass
        });
        let token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction
        });
        return res.status(201).json(user);
    } catch (err) {
        return res.status(500).json({ message: "signup error" });
    }
};

export const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User doesn't exist" });
        }
        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect credentials" });
        }
        let token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction
        });
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: "Login error" });
    }
};

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction
        });
        res.status(200).json({ message: "log out successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Logout error" });
    }
};