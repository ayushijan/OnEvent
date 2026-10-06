const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/login");
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            req.session.userId = null;
            req.session.role = null;
            return res.redirect("/login");
        }

        if (user.status === "blocked") {

            req.session.userId = null;
            req.session.role = null;

            return res.redirect("/login?blocked=true");
        }

        next();

    } catch (error) {

        res.status(500).send("Authentication error");

    }

};

module.exports = isAuthenticated;