const User = require("../../models/User");
const Otp = require("../../models/otp");
const crypto = require("crypto");
const emailService = require("./emailService");

const sendEmailChangeOtp = async (userId, newEmail) => {

    if (!newEmail || newEmail.trim() === "") {
        const error = new Error("Email is required");
        error.statusCode = 400;
        throw error;
    }

    newEmail = newEmail.toLowerCase().trim();

    if (!newEmail.includes("@") || !newEmail.includes(".")) {
        const error = new Error("Invalid email format");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.email === newEmail) {
        const error = new Error("New email is same as current email");
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await User.findOne({
        email: newEmail
    });

    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = new Date(Date.now() + 300000);

    await Otp.deleteMany({
        email: newEmail,
        purpose: "emailChange"
    });

    const otpData = new Otp({
        email: newEmail,
        otp: otp,
        expiresAt: expiresAt,
        purpose: "emailChange"
    });

    await otpData.save();

    await emailService(newEmail, otp);

    return {
        email: newEmail
    };
};

module.exports = sendEmailChangeOtp;