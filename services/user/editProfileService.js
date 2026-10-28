const User = require("../../models/User");
const STATUS_CODES = require("../../constants/statusCodes");
const RESPONSE_MESSAGES = require("../../constants/responseMessages");
const namePattern = /^[A-Za-z ]+$/;

const editProfile = async (userId, data) => {

    // Validate name
    if (!data.name || data.name.trim() === "") {
        const error = new Error(RESPONSE_MESSAGES.NAME_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if(!namePattern.test(data.name.trim())){
        const error = new Error(RESPONSE_MESSAGES.INVALID_NAME);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    // Validate phone number
    if (!data.phone || data.phone.trim() === "") {
        const error = new Error(RESPONSE_MESSAGES.PHONE_REQUIRED);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        throw error;
    }

    if (!/^[0-9]{10}$/.test(data.phone.trim())) {
        const error = new Error(RESPONSE_MESSAGES.INVALID_PHONE);
        error.statusCode = STATUS_CODES.BAD_REQUEST;
        error.code= "INVALID_PHONE";
        throw error;
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        error.statusCode = STATUS_CODES.NOT_FOUND;
        throw error;
    }

    // Update profile details
    user.name = data.name.trim();
    user.phone = data.phone.trim();

    // Update preferred location
    user.preferredLocation = data.preferredLocation
        ? data.preferredLocation.trim()
        : "";

    // Save changes
    await user.save();

    return user;
};

module.exports = editProfile;