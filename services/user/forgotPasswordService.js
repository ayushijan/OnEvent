const User = require("../../models/User");

const Otp = require("../../models/otp");

const crypto = require("crypto");

const emailService = require("./emailService");

const forgotPassword = async (data) => {

    if (!data.email || data.email.trim() === "") {

        const error = new Error("Email is required");

        error.statusCode = 400;

        throw error;
    }

    const user = await User.findOne({
        email: data.email
    });

    if (!user) {

        const error = new Error("Email not registered");

        error.statusCode = 404;

        throw error;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = new Date(Date.now() + 300000);

    await Otp.deleteMany({
        email: data.email,
        purpose: "forgotPassword"
    });

    const otpData = new Otp({

        email: data.email,

        otp: otp,

        expiresAt: expiresAt,

        purpose: "forgotPassword"

    });

    await otpData.save();

    await emailService(data.email, otp);

    return {
        email: data.email
    };

};

module.exports = forgotPassword;