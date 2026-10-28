const User = require("../../models/User");
const bcryptjs = require("bcryptjs");

const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");

const resetPassword = async (data, session) => {

    // Verify OTP verification status
    if (!session.resetVerified || session.resetEmail !== data.email) {
        const error = new Error(
            "Please verify the OTP before resetting your password"
        );

        error.statusCode = STATUS_CODES.FORBIDDEN;
        throw error;
    }

    // Validate email
    if (!data.email || data.email.trim() === "") {
        const error = new Error(RESPONSE_MESSAGES.EMAIL_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate password
    if (!data.password) {
        const error = new Error(RESPONSE_MESSAGES.PASSWORD_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (data.password.length < 8) {
        const error = new Error(
            "Password must be at least 8 characters"
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/[A-Z]/.test(data.password)) {
        const error = new Error(
            "Password must contain at least one uppercase"
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/[a-z]/.test(data.password)) {
        const error = new Error(
            "Password must contain at least one lowercase"
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/[0-9]/.test(data.password)) {
        const error = new Error(
            "Password must contain at least one number"
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/[^A-Za-z0-9]/.test(data.password)) {
        const error = new Error(
            "Password must contain at least one special character"
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Confirm password
    if (data.password !== data.confirmPassword) {
        const error = new Error("Passwords do not match");
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Find user
    const user = await User.findOne({
        email: data.email
    });

    if (!user) {
        const error = new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    user.password = hashedPassword;

    await user.save();

    return {
        message: "Password reset successfully"
    };
};

module.exports = resetPassword;