const User = require("../../models/User");
const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");

const namePattern = /^[A-Za-z ]+$/;

const editProfile = async (userId, data) => {

    // =====================================
    // VALIDATE NAME
    // =====================================

    const name = data.name ? data.name.trim() : "";

    if (!name) {
        const error = new Error(RESPONSE_MESSAGES.NAME_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!namePattern.test(name)) {
        const error = new Error(RESPONSE_MESSAGES.INVALID_NAME);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }


    // =====================================
    // VALIDATE PHONE NUMBER
    // =====================================

    const phone = data.phone ? data.phone.trim() : "";

    // Phone number is optional
    if (phone !== "") {

        // Must contain exactly 10 digits
        if (!/^[0-9]{10}$/.test(phone)) {
            const error = new Error(RESPONSE_MESSAGES.INVALID_PHONE);
            error.statusCode = STATUS_CODES.BAD_REQUEST;
            error.code = "INVALID_PHONE";
            throw error;
        }

        // Reject 0000000000
        if (/^0{10}$/.test(phone)) {
            const error = new Error(
                "Phone number cannot contain only zeros."
            );

            error.statusCode = STATUS_CODES.BAD_REQUEST;
            error.code = "INVALID_PHONE";
            throw error;
        }
    }


    // =====================================
    // FIND USER
    // =====================================

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }


    // =====================================
    // UPDATE PROFILE
    // =====================================

    user.name = name;
    user.phone = phone;

    user.preferredLocation = data.preferredLocation
        ? data.preferredLocation.trim()
        : "";


    // =====================================
    // SAVE CHANGES
    // =====================================

    await user.save();

    return user;
};

module.exports = editProfile;