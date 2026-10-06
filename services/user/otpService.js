const User = require("../../models/User");

const crypto = require("crypto");

const Otp = require("../../models/otp");

const emailService = require("./emailService");

const resendOtp = async (email) => {

    if(!email || email.trim() === ""){

        const error = new Error("Email is required");

        error.statusCode = 400;

        throw error;

    }

    const user = await User.findOne({

        email: email

    });

    if(!user){

        const error = new Error("User not found");

        error.statusCode = 404;

        throw error;

    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = new Date(Date.now() + 300000);

    await Otp.deleteMany({

        email: email,
        purpose: "signup"

    });

    const otpData = new Otp({

        email: email,

        otp: otp,

        expiresAt: expiresAt,

        purpose: "signup"

    });

    await otpData.save();

    await emailService(email, otp);

    return {

        message: "OTP sent successfully"

    };

};


const verifyOtp = async (email, otp) => {

    const otpData = await Otp.findOne({

        email: email,
        purpose: "signup"

    });


    if(!otpData){

        const error = new Error("OTP not found");

        error.statusCode = 404;

        throw error;

    }

    if(otpData.expiresAt < new Date()){

        const error = new Error("OTP has expired");

        error.statusCode = 400;

        throw error;

    }

    if(otpData.otp !== otp){

        const error = new Error("Invalid OTP");

        error.statusCode = 400;

        throw error;

    }

    const user = await User.findOne({

        email: email

    });

    if(!user){

        const error = new Error("User not found");

        error.statusCode = 404;

        throw error;

    }

    user.isVerified = true;

    await user.save();

    await Otp.deleteOne({

        _id: otpData._id

    });

    return {

        message: "OTP verified successfully",
        userId: user._id

    };

};

const verifyForgotPasswordOtp = async (email, otp) => {

    const otpData = await Otp.findOne({
        email: email,
        purpose: "forgotPassword"
    });

    if (!otpData) {

        const error = new Error("OTP not found");

        error.statusCode = 404;

        throw error;
    }

    if (otpData.expiresAt < new Date()) {

        const error = new Error("OTP has expired");

        error.statusCode = 400;

        throw error;
    }

    if (otpData.otp !== otp) {

        const error = new Error("Invalid OTP");

        error.statusCode = 400;

        throw error;
    }

    await Otp.deleteOne({
        _id: otpData._id
    });

    return {
        message: "OTP verified successfully",
        email: email
    };

};


module.exports = {

    resendOtp,

    verifyOtp,

    verifyForgotPasswordOtp

};