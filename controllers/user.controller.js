import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utlils/datauri.js";
import cloudinary from "../utlils/cloudinary.js";

const genrateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        console.log(user.generateAccessToken())
        const accessToke = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // Save refresh token in the database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToke, refreshToken }
    } catch (error) {
        throw new Error("Something went wrong while generating refresh and access token");
    }
}

export const register = async (req, res) => {
    try {
        const { fullname, email, password, role, phoneNumber } = req.body

        const file = req.file;
        let cloudResponse;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        if ([fullname, email, role, password, phoneNumber].some((field) => field?.trim() === "")) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "User already exists with this email",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            password: hashedPassword,
            role,
            phoneNumber,
            profile: {
                proflilePhoto: cloudResponse?.secure_url || ""
            }
        });

        return res.status(200).json({
            message: "User created successfully",
            success: true
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if ([email, password, role].some((field) => field?.trim() === "")) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "user not found",
                success: false
            });
        }


        const isPasswordMatch = await user.isPasswordCorrect(password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect password",
                success: false
            });
        }

        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist",
                success: false
            });
        }

        const { accessToke, refreshToken } = await genrateAccessAndRefreshTokens(user._id)




        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            profile: user.profile
        }

        const options = {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV === "development" ? "lax" : "none"
        }

        return res.status(200).cookie("token", accessToke, options).cookie("refreshToken", refreshToken, options).json({
            message: `welcome back ${user.fullname}`,
            success: true,
            user,
            token: accessToke,
            refreshToken: refreshToken
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200).clearCookie("token").json({
            message: "User logged out successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;
        const fileUri = getDataUri(file);

        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);


        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");

        }

        const userId = req.id;

        let user = await User.findById(userId)

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;

        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            profile: user.profile
        }

        return res.status(200).json({
            message: "profile update successfully",
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}
