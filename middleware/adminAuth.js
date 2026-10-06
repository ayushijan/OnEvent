const isAdmin = (req, res, next) => {
    if (!req.session.adminId || req.session.adminRole !== "admin") {
        return res.redirect("/admin/login");
    }

    next();
};

module.exports = isAdmin;