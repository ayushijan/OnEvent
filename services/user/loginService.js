const User = require("../../models/User");
const bcryptjs = require("bcryptjs");

const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");

const login = async (data) => {

    // Validate email
    if (!data.email || data.email.trim() === "") {
        const error = new Error(RESPONSE_MESSAGES.EMAIL_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate password
    if (!data.password || data.password.trim() === "") {
        const error = new Error(RESPONSE_MESSAGES.PASSWORD_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Normalize email
    const email = data.email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
        const error = new Error(
            "Account not found. Please sign up to continue."
        );

        error.statusCode = STATUS_CODES.UNAUTHORIZED;
        throw error;
    }

    // Check email verification
    if (!user.isVerified) {
        const error = new Error("Please verify your email first");
        error.statusCode = STATUS_CODES.FORBIDDEN;
        throw error;
    }

    // Check account status
    if (user.status === "blocked") {
        const error = new Error(
            "Your account has been blocked. Please contact support."
        );

        error.statusCode = STATUS_CODES.FORBIDDEN;
        throw error;
    }

    // Check Google authentication
    if (user.authProvider === "google" && !user.password) {
        const error = new Error(
            "This account uses Google login. Please continue with Google."
        );

        error.statusCode = STATUS_CODES.FORBIDDEN;
        throw error;
    }

    // Compare password
    const passwordMatch = await bcryptjs.compare(
        data.password,
        user.password
    );

    if (!passwordMatch) {
        const error = new Error(
            RESPONSE_MESSAGES.INVALID_CREDENTIALS
        );

        error.statusCode = STATUS_CODES.UNAUTHORIZED;
        throw error;
    }

    return {
        message: "Login successful",
        userId: user._id
    };
};

module.exports = login;