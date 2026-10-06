const User = require("../../models/User");

const bcrypt = require("bcryptjs");


const adminLogin = async (email, password) => {

    if (!email || !password) {

        const error = new Error("Email and password are required");
        error.statusCode = 400;

        throw error;

    }


    const user = await User.findOne({
        email: email.toLowerCase().trim()
    });


    if (!user) {

        const error = new Error("Invalid email or password");
        error.statusCode = 401;

        throw error;

    }


    if (user.role !== "admin") {

        const error = new Error("Access denied");
        error.statusCode = 403;

        throw error;

    }


    if (user.status === "blocked") {

        const error = new Error("Admin account is blocked");
        error.statusCode = 403;

        throw error;

    }


    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );


    if (!passwordMatch) {

        const error = new Error("Invalid email or password");
        error.statusCode = 401;

        throw error;

    }


    return {
        userId: user._id,
        role: user.role
    };

};


module.exports = adminLogin;