const User = require("../../models/User");
const Otp = require("../../models/otp");

const verifyEmailChangeOtp = async (userId, newEmail, otp) => {

    if (!newEmail || newEmail.trim() === "") {
        const error = new Error("Email is required");
        error.statusCode = 400;
        throw error;
    }

    if (!otp || otp.trim() === "") {
        const error = new Error("OTP is required");
        error.statusCode = 400;
        throw error;
    }

    newEmail = newEmail.toLowerCase().trim();

    const otpData = await Otp.findOne({
        email: newEmail,
        purpose: "emailChange"
    });

    if (!otpData) {
        const error = new Error("OTP not found");
        error.statusCode = 404;
        throw error;
    }

    if (otpData.expiresAt < new Date()) {
        const error = new Error("OTP has expired");
        error.statusCode = 400;
        throw error;
    }

    if (otpData.otp !== otp) {
        const error = new Error("Invalid OTP");
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

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    user.email = newEmail;
    user.isVerified = true;

    await user.save();

    await Otp.deleteOne({
        _id: otpData._id
    });

    return {
        message: "Email changed successfully"
    };
};

module.exports = verifyEmailChangeOtp;