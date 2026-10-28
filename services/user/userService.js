const User = require("../../models/User");
const bcryptjs = require("bcryptjs");
const Otp = require("../../models/otp");
const crypto = require("crypto");
const sendOtp = require("./emailService");

const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");

const signup = async (data) => {

    // Validate request data
    if (!data || typeof data !== "object") {
        const error = new Error("Invalid signup data");
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Normalize name
    const name = typeof data.name === "string"
        ? data.name.trim().replace(/\s+/g, " ")
        : "";

    // Validate name
    if (!name) {
        const error = new Error(RESPONSE_MESSAGES.NAME_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/^[A-Za-z ]+$/.test(name)) {
        const error = new Error(
            "Name must contain only letters and spaces"
        );
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Normalize email
    const email = typeof data.email === "string"
        ? data.email.trim().toLowerCase()
        : "";

    // Validate email
    if (!email) {
        const error = new Error(RESPONSE_MESSAGES.EMAIL_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        const error = new Error("Invalid email format");
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate phone number
    const phone = typeof data.phone === "string"
        ? data.phone.trim()
        : "";

    if (!phone) {
        const error = new Error(RESPONSE_MESSAGES.PHONE_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        const error = new Error(RESPONSE_MESSAGES.INVALID_PHONE);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate password
    const password = typeof data.password === "string"
        ? data.password
        : "";

    if (password.length < 8) {
        const error = new Error(
            "Password must be at least 8 characters"
        );
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/[A-Z]/.test(password)) {
        const error = new Error(
            "Password must contain at least one uppercase letter"
        );
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/[a-z]/.test(password)) {
        const error = new Error(
            "Password must contain at least one lowercase letter"
        );
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/[0-9]/.test(password)) {
        const error = new Error(
            "Password must contain at least one number"
        );
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        const error = new Error(
            "Password must contain at least one special character"
        );
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Check whether the email is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = STATUS_CODES.CONFLICT;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Prepare user data without modifying the original object
    const userData = {
        ...data,
        name,
        email,
        phone,
        password: hashedPassword
    };

    // Generate signup OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Send the OTP before creating the user.
    // If email delivery fails, the user is not created.
    await sendOtp(email, otp);

    // Create user
    const user = new User(userData);
    const result = await user.save();

    // Remove any previous signup OTPs for this email
    await Otp.deleteMany({
        email,
        purpose: "signup"
    });

    // Save the new OTP
    const otpData = new Otp({
        email,
        otp,
        expiresAt,
        purpose: "signup"
    });

    await otpData.save();

    // Remove password from the returned result
    const userResult = result.toObject();
    delete userResult.password;

    return userResult;
};

module.exports = signup;