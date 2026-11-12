const User = require("../../models/User");
const crypto = require("crypto");
const Otp = require("../../models/otp");
const emailService = require("./emailService");

const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");


// =====================================
// RESEND SIGNUP OTP
// =====================================

const resendOtp = async (email) => {

    if (!email || email.trim() === "") {
        const error = new Error(RESPONSE_MESSAGES.EMAIL_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    const user = await User.findOne({
        email: email
    });

    if (!user) {
        const error = new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 60000);

    await Otp.deleteMany({
        email: email,
        purpose: "signup"
    });

    const otpData = new Otp({
        email: email,
        otp: otp,
        expiresAt: expiresAt,
        purpose: "signup"
    });

    await otpData.save();

    await emailService(email, otp);

    return {
        message: "OTP sent successfully"
    };
};


// =====================================
// VERIFY SIGNUP OTP
// =====================================

const verifyOtp = async (email, otp) => {

    const otpData = await Otp.findOne({
        email: email,
        purpose: "signup"
    });

    if (!otpData) {
        const error = new Error("OTP not found");
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }

    if (otpData.expiresAt < new Date()) {
        const error = new Error(RESPONSE_MESSAGES.OTP_EXPIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (otpData.otp !== otp) {
        const error = new Error(RESPONSE_MESSAGES.OTP_INVALID);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    const user = await User.findOne({
        email: email
    });

    if (!user) {
        const error = new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }

    user.isVerified = true;

    await user.save();

    await Otp.deleteOne({
        _id: otpData._id
    });

    return {
        message: "OTP verified successfully",
        userId: user._id
    };
};


// =====================================
// VERIFY FORGOT PASSWORD OTP
// =====================================

const verifyForgotPasswordOtp = async (email, otp) => {

    if (!email || !otp) {
        const error = new Error("Email and OTP are required.");
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpData = await Otp.findOne({
        email: normalizedEmail,
        purpose: "forgotPassword"
    });

    if (!otpData) {
        const error = new Error(
            "Invalid OTP. Please try again."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (otpData.expiresAt < new Date()) {
        const error = new Error(
            RESPONSE_MESSAGES.OTP_EXPIRED
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (otpData.otp !== otp) {
        const error = new Error(
            "Invalid OTP. Please try again."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    await Otp.deleteOne({
        _id: otpData._id
    });

    return {
        message: "OTP verified successfully",
        email: normalizedEmail
    };
};


// =====================================
// RESEND FORGOT PASSWORD OTP
// =====================================

const resendForgotPasswordOtp = async (email) => {
    if (!email || typeof email !== "string" || email.trim() === "") {
        const error = new Error(RESPONSE_MESSAGES.EMAIL_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        const error = new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }

    if (user.authProvider === "google") {
        const error = new Error(
            "This account was registered using Google. Please sign in with Google."
        );
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 60000);

    // The email + purpose unique index means we update the existing record.
    await Otp.findOneAndUpdate(
        { email: normalizedEmail, purpose: "forgotPassword" },
        { $set: { otp, expiresAt } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await emailService(normalizedEmail, otp);

    return { message: "A new OTP has been sent successfully." };
};


// =====================================
// EXPORT SERVICES
// =====================================

module.exports = {
    resendOtp,
    verifyOtp,
    verifyForgotPasswordOtp,
    resendForgotPasswordOtp
};