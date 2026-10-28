const User = require("../../models/User");
const Otp = require("../../models/otp");
const crypto = require("crypto");

const emailService = require("./emailService");

const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");

const sendEmailChangeOtp = async (userId, newEmail) => {

    // Validate email input.
    if (typeof newEmail !== "string" || !newEmail.trim()) {
        const error = new Error(RESPONSE_MESSAGES.EMAIL_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    newEmail = newEmail.trim().toLowerCase();

    // Validate email format.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(newEmail)) {
        const error = new Error("Please enter a valid email address.");
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Find the current user.
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }

    // Google users cannot change their email through this flow.
    if (user.authProvider === "google") {
        const error = new Error(
            "Users signed in with Google cannot change their email address."
        );
        error.statusCode = STATUS_CODES.FORBIDDEN;
        throw error;
    }

    // Ensure the new email differs from the current email.
    if (user.email.toLowerCase() === newEmail) {
        const error = new Error(
            "Your new email must be different from your current email."
        );
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Ensure the email isn't already registered.
    const existingUser = await User.findOne({
        email: newEmail
    });

    if (existingUser) {
        const error = new Error(
            "This email address is already registered."
        );
        error.statusCode = STATUS_CODES.CONFLICT;
        throw error;
    }

    // Generate a cryptographically secure six-digit OTP.
    const otp = crypto.randomInt(100000, 1000000).toString();

    // OTP expires in five minutes.
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save the OTP.
    const otpData = new Otp({
        email: newEmail,
        otp,
        expiresAt,
        purpose: "emailChange"
    });

    await otpData.save();

    try {

        // Send the OTP to the new email address.
        await emailService(newEmail, otp);

    } catch (error) {

        // Remove the newly created OTP if email delivery fails.
        await Otp.deleteOne({
            _id: otpData._id
        });

        throw error;
    }

    // Remove older OTPs after successful email delivery.
    await Otp.deleteMany({
        email: newEmail,
        purpose: "emailChange",
        _id: { $ne: otpData._id }
    });

    return {
        email: newEmail
    };
};

module.exports = sendEmailChangeOtp;
