const User = require("../../models/User");

const editProfile = async (userId, data) => {

    if (!data.name || data.name.trim() === "") {
        const error = new Error("Name is required");
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

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    user.name = data.name.trim();
    user.phone = data.phone.trim();

    await user.save();

    return user;
};

module.exports = editProfile;