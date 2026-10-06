const User = require("../../models/User");


const updateUserStatus = async (userId, status) => {

    if (!userId) {

        const error = new Error("User ID is required");
        error.statusCode = 400;

        throw error;

    }


    if (!["active", "blocked"].includes(status)) {

        const error = new Error("Invalid status");
        error.statusCode = 400;

        throw error;

    }


    const user = await User.findOne({
        _id: userId,
        role: "user"
    });


    if (!user) {

        const error = new Error("User not found");
        error.statusCode = 404;

        throw error;

    }


    user.status = status;

    await user.save();


    return {
        message:
            status === "blocked"
                ? "User blocked successfully"
                : "User unblocked successfully"
    };

};


module.exports = updateUserStatus;