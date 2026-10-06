const User = require("../../models/User");

const bcryptjs = require("bcryptjs");

const login = async (data) => {

    if (!data.email || data.email.trim() === "") {

        const error = new Error("Email is required");

        error.statusCode = 400;

        throw error;
    }

    if (!data.password || data.password.trim() === "") {

        const error = new Error("Password is required");

        error.statusCode = 400;

        throw error;
    }

    const user = await User.findOne({
        email: data.email
    });

    if (!user) {

        const error = new Error("Invalid email or password");

        error.statusCode = 401;

        throw error;
    }

    if (!user.isVerified) {

        const error = new Error("Please verify your email first");

        error.statusCode = 403;

        throw error;
    }

    if (user.status === "blocked") {

        const error = new Error("Your account has been blocked");

        error.statusCode = 403;

        throw error;
    }

    if (user.authProvider === "google" && !user.password) {

    const error = new Error(
        "This account uses Google login. Please continue with Google."
    );

    error.statusCode = 403;

    throw error;
    
    }

    const passwordMatch = await bcryptjs.compare(
        data.password,
        user.password
    );

    if (!passwordMatch) {

        const error = new Error("Invalid email or password");

        error.statusCode = 401;

        throw error;
    }

    return {
        message: "Login successful",
        userId: user._id
    };

};

module.exports = login;