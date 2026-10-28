const isAdmin = (req, res, next) => {
    // Prevent protected admin pages from being cached.
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "Pragma": "no-cache",
        "Expires": "0"
    });

    // Check whether an admin session exists.
    if (
        !req.session ||
        !req.session.adminId ||
        req.session.adminRole !== "admin"
    ) {
        return res.redirect(303, "/admin/login");
    }

    return next();
};

module.exports = isAdmin;