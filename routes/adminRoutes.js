const express = require("express");

const router = express.Router();

const adminLoginController = require("../controllers/admin/adminLoginController");
const adminController = require("../controllers/admin/adminController");
const isAdmin = require("../middleware/adminAuth");
const adminUserController = require("../controllers/admin/adminUserController");

// ==================== PREVENT CACHE ====================

const preventCache = (req, res, next) => {
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
    });

    next();
};

// ==================== ADMIN LOGIN PAGE ====================

router.get("/admin/login", preventCache, (req, res) => {
    if (
        req.session &&
        req.session.adminId &&
        req.session.adminRole === "admin"
    ) {
        return res.redirect(303, "/admin/dashboard");
    }

    return res.render("admin/login");
});

// ==================== ADMIN LOGIN ====================

router.post("/admin/login", adminLoginController);

// ==================== ADMIN DASHBOARD ====================

router.get(
"/admin/dashboard",
isAdmin,
adminController.dashboard
);

// ==================== EXPORT ALL USERS ====================

router.get(
"/admin/users/export",
isAdmin,
adminController.exportUsers
);


// ==================== ADMIN LOGOUT ====================

router.post("/admin/logout", preventCache, (req, res, next) => {
    const clearSessionCookie = () => {
        res.clearCookie("onevent.sid", {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });
    };

    if (!req.session) {
        clearSessionCookie();
        return res.redirect(303, "/admin/login");
    }

    req.session.destroy((error) => {
        if (error) {
            return next(error);
        }

        clearSessionCookie();

        res.set({
            "Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0"
        });

        return res.redirect(303, "/admin/login?loggedOut=true");
    });
});

// ==================== UPDATE USER STATUS ====================

router.post(
    "/admin/users/:id/status",
    isAdmin,
    adminUserController.updateUserStatus
);

module.exports = router;
