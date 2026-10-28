const User = require("../models/User");

const preventCache = (res) => {
res.set({
"Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
"Pragma": "no-cache",
"Expires": "0"
});
};

const clearSessionCookie = (res) => {
res.clearCookie("onevent.sid", {
path: "/",
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: "lax"
});
};

const isAuthenticated = async (req, res, next) => {
preventCache(res);

if (!req.session || !req.session.userId) {
    return res.redirect(303, "/login");
}

try {
    const user = await User.findById(req.session.userId);

    if (!user || user.status !== "active") {
        const wasBlocked = user && user.status === "blocked";

        return req.session.destroy((error) => {
            if (error) {
                return next(error);
            }

            clearSessionCookie(res);

            if (wasBlocked) {
                return res.redirect(303, "/login?blocked=true");
            }

            return res.redirect(303, "/login");
        });
    }

    req.currentUser = user;

    return next();
} catch (error) {
    return next(error);
}

};

module.exports = isAuthenticated;
