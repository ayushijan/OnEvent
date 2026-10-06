const User = require("../../models/User");

const bcryptjs = require("bcryptjs");

const Otp = require("../../models/otp");

const crypto = require("crypto");

const sendOtp = require("./emailService");

const signup = async (data) => {

    if (!data.name || data.name.trim() === "") {

        const error = new Error("Name is required");

        error.statusCode = 400;

        throw error;
    }

    if (!data.email || data.email.trim() === "") {

        const error = new Error("Email is required");

        error.statusCode = 400;

        throw error;
    }

    if (!data.email.includes("@") || !data.email.includes(".")) {

        const error = new Error("Invalid email format");

        error.statusCode = 400;

        throw error;
    }

    if (!data.phone || data.phone.trim() === "") {

        const error = new Error("Phone number is required");

        error.statusCode = 400;

        throw error;
    }

    if (!/^[0-9]{10}$/.test(data.phone)) {

        const error = new Error("Invalid phone number");

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

    const existingUser = await User.findOne({

        email: data.email

    });

    if (existingUser) {

        const error = new Error("Email already registered");

        error.statusCode = 409;

        throw error;
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    data.password = hashedPassword;

    const user = new User(data);

    const result = await user.save();

    const otp = crypto.randomInt(100000,1000000).toString();

    const expiresAt = new Date(Date.now() + 300000);

    const otpData = new Otp({
        email: data.email,
        otp: otp,
        expiresAt: expiresAt,
        purpose: "signup"
    })

    await otpData.save();

    await sendOtp(data.email,otp);

    delete result.password;

    return result;
};

module.exports = signup;