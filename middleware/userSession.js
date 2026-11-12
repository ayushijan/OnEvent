const User = require("../models/User");

const userSession = async (req, res, next) => {
    try {
        res.locals.user = null;

        if (req.session?.userId && req.session.role === "user") {
            const user = await User.findById(req.session.userId)
                .select("name email profileImage");

            res.locals.user = user;
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = userSession;