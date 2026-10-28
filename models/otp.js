const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    otp: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true,
        expires: 0
    },

    purpose: {
        type: String,
        required: true,
        enum: ["signup", "forgotPassword", "emailChange"]
    }

});

// Improve lookups by email and OTP purpose.
otpSchema.index(
    { email: 1, purpose: 1 },
    { unique: true }
);

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
