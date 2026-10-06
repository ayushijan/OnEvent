const User = require("../../models/User");

const bcryptjs = require("bcryptjs");

const resetPassword = async (data,session) => {

    if (!session.resetVerified || session.resetEmail !== data.email) {

    const error = new Error(
        "Please verify the OTP before resetting your password"
    );

    error.statusCode = 403;

    throw error;
    
    }

    if (!data.email || data.email.trim() === "") {

        const error = new Error("Email is required");

        error.statusCode = 400;

        throw error;
    }

    if (!data.password) {

        const error = new Error("Password is required");

        error.statusCode = 400;

        throw error;
    }

    if (data.password.length < 8) {

        const error = new Error("Password must be at least 8 characters");

        error.statusCode = 400;

        throw error;
    }

    if (!/[A-Z]/.test(data.password)) {

        const error = new Error("Password must contain at least one uppercase");

        error.statusCode = 400;

        throw error;
    }

    if (!/[a-z]/.test(data.password)) {

        const error = new Error("Password must contain at least one lowercase");

        error.statusCode = 400;

        throw error;
    }

    if (!/[0-9]/.test(data.password)) {

        const error = new Error("Password must contain at least one number");

        error.statusCode = 400;

        throw error;
    }

    if (!/[^A-Za-z0-9]/.test(data.password)) {

        const error = new Error("Password must contain at least one special character");

        error.statusCode = 400;

        throw error;
    }

    if (data.password !== data.confirmPassword) {

        const error = new Error("Passwords do not match");

        error.statusCode = 400;

        throw error;
    }

    const user = await User.findOne({
        email: data.email
    });

    if (!user) {

        const error = new Error("User not found");

        error.statusCode = 404;

        throw error;
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    user.password = hashedPassword;

    await user.save();

    return {
        message: "Password reset successfully"
    };

};

module.exports = resetPassword;