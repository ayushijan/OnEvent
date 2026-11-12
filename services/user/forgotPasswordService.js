const User = require("../../models/User");
const Otp = require("../../models/otp");
const crypto = require("crypto");
const emailService = require("./emailService");

const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");


// =====================================
// FORGOT PASSWORD
// =====================================

const forgotPassword = async (data) => {

    // Validate email
    if (!data.email || data.email.trim() === "") {

        const error = new Error(
            RESPONSE_MESSAGES.EMAIL_REQUIRED
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;

        throw error;
    }


    // Normalize email
    const email = data.email.trim().toLowerCase();


    // Find user
    const user = await User.findOne({
        email: email
    });


    // Check whether user exists
    if (!user) {

        const error = new Error(
            RESPONSE_MESSAGES.USER_NOT_FOUND
        );

        error.statusCode = STATUS_CODES.NOT_FOUND;

        throw error;
    }


    // Prevent Google-only accounts from resetting password
    if (user.authProvider === "google") {

        const error = new Error(
            "This account was registered using Google. Please sign in with Google."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;

        throw error;
    }


    // Generate six-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();


    // OTP expires after 60 seconds
    const expiresAt = new Date(Date.now() + 60000);


    // Delete previous forgot-password OTPs
    await Otp.deleteMany({
        email: email,
        purpose: "forgotPassword"
    });


    // Create new OTP
    const otpData = new Otp({

        email: email,

        otp: otp,

        expiresAt: expiresAt,

        purpose: "forgotPassword"

    });


    await otpData.save();


    // Send OTP email
    await emailService(email, otp);


    // Return email
    return {
        email: email
    };

};


// =====================================
// EXPORT SERVICE
// =====================================

module.exports = forgotPassword;