const User = require("../../models/User");
const bcrypt = require("bcryptjs");

const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");

const changePassword = async (userId, data) => {

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }

    // Prevent Google users from changing their password here
    if (user.authProvider === "google") {
        const error = new Error(
            "Google users cannot change their password here. Please manage your password through your Google Account."
        );

        error.statusCode = STATUS_CODES.FORBIDDEN;
        throw error;
    }

    // Validate that the submitted values are strings
    const { currentPassword, newPassword, confirmPassword } = data || {};

    if (
        typeof currentPassword !== "string" ||
        currentPassword.length === 0
    ) {
        const error = new Error("Current password is required");
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (
        typeof newPassword !== "string" ||
        newPassword.length === 0
    ) {
        const error = new Error("Please enter a new password.");
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (
        typeof confirmPassword !== "string" ||
        confirmPassword.length === 0
    ) {
        const error = new Error("Please confirm your new password.");
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate minimum password length
    if (newPassword.length < 8) {
        const error = new Error(
            "Password must be at least 8 characters."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
        const error = new Error(
            "Password must contain an uppercase letter."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate lowercase letter
    if (!/[a-z]/.test(newPassword)) {
        const error = new Error(
            "Password must contain a lowercase letter."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate number
    if (!/[0-9]/.test(newPassword)) {
        const error = new Error(
            "Password must contain a number."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate special character
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
        const error = new Error(
            "Password must contain a special character."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
        const error = new Error(
            "New password and confirm password do not match."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!passwordMatch) {
        const error = new Error(RESPONSE_MESSAGES.INVALID_PASSWORD);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Prevent reusing the current password
    const samePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (samePassword) {
        const error = new Error(
            "New password must be different from current password."
        );

        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Hash and save the new password
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return {
        message: "Password changed successfully."
    };
};

module.exports = changePassword;
