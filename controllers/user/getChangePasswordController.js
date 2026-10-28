const User = require("../../models/User");

const getChangePassword = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect("/login");
        }

        res.render("user/changePassword", {
            user,
            successMessage: "",
            errorMessage: ""
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to load the Change Password page.");
    }
};

module.exports = getChangePassword;