const User = require("../../models/User");

const bcrypt = require("bcryptjs");


const changePassword = async (userId, data) => {

    if (!data.currentPassword) {

        const error = new Error("Current password is required");
        error.statusCode = 400;
        throw error;

    }


    if (!data.newPassword) {

        const error = new Error("New password is required");
        error.statusCode = 400;
        throw error;

    }


    if (!data.confirmPassword) {

        const error = new Error("Confirm password is required");
        error.statusCode = 400;
        throw error;

    }


    if (data.newPassword.length < 8) {

        const error = new Error(
            "Password must be at least 8 characters"
        );

        error.statusCode = 400;
        throw error;

    }


    if (!/[A-Z]/.test(data.newPassword)) {

        const error = new Error(
            "Password must contain an uppercase letter"
        );

        error.statusCode = 400;
        throw error;

    }


    if (!/[a-z]/.test(data.newPassword)) {

        const error = new Error(
            "Password must contain a lowercase letter"
        );

        error.statusCode = 400;
        throw error;

    }


    if (!/[0-9]/.test(data.newPassword)) {

        const error = new Error(
            "Password must contain a number"
        );

        error.statusCode = 400;
        throw error;

    }


    if (!/[^A-Za-z0-9]/.test(data.newPassword)) {

        const error = new Error(
            "Password must contain a special character"
        );

        error.statusCode = 400;
        throw error;

    }


    if (data.newPassword !== data.confirmPassword) {

        const error = new Error(
            "New password and confirm password do not match"
        );

        error.statusCode = 400;
        throw error;

    }


    const user = await User.findById(userId);

    if (!user) {

        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;

    }


    const passwordMatch = await bcrypt.compare(
        data.currentPassword,
        user.password
    );


    if (!passwordMatch) {

        const error = new Error("Current password is incorrect");
        error.statusCode = 400;
        throw error;

    }


    const samePassword = await bcrypt.compare(
        data.newPassword,
        user.password
    );


    if (samePassword) {

        const error = new Error(
            "New password must be different from current password"
        );

        error.statusCode = 400;
        throw error;

    }


    user.password = await bcrypt.hash(
        data.newPassword,
        10
    );


    await user.save();


    return {
        message: "Password changed successfully"
    };

};


module.exports = changePassword;