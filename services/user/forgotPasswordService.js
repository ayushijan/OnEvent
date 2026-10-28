const User = require("../../models/User");
const Otp = require("../../models/otp");
const crypto = require("crypto");
const emailService = require("./emailService");

const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");

const forgotPassword = async (data) => {

    // Validate email
    if (!data.email || data.email.trim() === "") {
        const error = new Error(RESPONSE_MESSAGES.EMAIL_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Find user
    const user = await User.findOne({
        email: data.email
    });

    if (!user) {
        const error = new Error("Email not registered");
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = new Date(Date.now() + 300000);

    // Delete previous forgot-password OTPs
    await Otp.deleteMany({
        email: data.email,
        purpose: "forgotPassword"
    });

    // Create new OTP
    const otpData = new Otp({
        email: data.email,
        otp: otp,
        expiresAt: expiresAt,
        purpose: "forgotPassword"
    });

    await otpData.save();

    // Send OTP email
    await emailService(data.email, otp);

    return {
        email: data.email
    };
};

module.exports = forgotPassword;