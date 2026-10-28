const User = require("../../models/User");
const Otp = require("../../models/otp");

const verifyEmailChangeOtp = async (userId, newEmail, otp) => {

    // Validate email.
    if (!newEmail || !String(newEmail).trim()) {
        const error = new Error("Email address is required.");
        error.statusCode = 400;
        throw error;
    }

    newEmail = String(newEmail).trim().toLowerCase();

    // Validate OTP.
    otp = String(otp || "").trim();

    if (!/^\d{6}$/.test(otp)) {
        const error = new Error("Please enter a valid six-digit OTP.");
        error.statusCode = 400;
        throw error;
    }

    // Find the current user.
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found. Please log in again.");
        error.statusCode = 404;
        throw error;
    }

    // Google accounts cannot change their email through this flow.
    if (user.authProvider === "google") {
        const error = new Error(
            "Users signed in with Google cannot change their email address."
        );
        error.statusCode = 403;
        throw error;
    }

    // Check whether another account already uses this email.
    const existingUser = await User.findOne({
        email: newEmail,
        _id: { $ne: user._id }
    });

    if (existingUser) {
        const error = new Error(
            "This email address is already registered."
        );
        error.statusCode = 409;
        throw error;
    }

    // Find the OTP associated with this email-change request.
    const otpData = await Otp.findOne({
        email: newEmail,
        purpose: "emailChange"
    });

    if (!otpData) {
        const error = new Error(
            "Verification code not found. Please request a new OTP."
        );
        error.statusCode = 400;
        throw error;
    }

    // Check whether the OTP has expired.
    if (
        !otpData.expiresAt ||
        new Date(otpData.expiresAt).getTime() <= Date.now()
    ) {
        await Otp.deleteOne({ _id: otpData._id });

        const error = new Error(
            "Your OTP has expired. Please request a new one."
        );
        error.statusCode = 400;
        throw error;
    }

    // Reject an incorrect OTP.
    if (String(otpData.otp).trim() !== otp) {
        const error = new Error(
            "Incorrect OTP. Please check the code and try again."
        );
        error.statusCode = 400;
        throw error;
    }

    // Update the email only after successful verification.
    user.email = newEmail;
    user.isVerified = true;

    await user.save();

    // Delete the OTP after successful verification.
    await Otp.deleteOne({ _id: otpData._id });

    return {
        message: "Email changed successfully."
    };
};

module.exports = verifyEmailChangeOtp;
