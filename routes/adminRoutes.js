const express = require("express");

const router = express.Router();

const adminLoginController = require("../controllers/admin/adminLoginController");

const adminController = require("../controllers/admin/adminController");

const isAdmin = require("../middleware/adminAuth");

const adminUserController = require("../controllers/admin/adminUserController");


// Admin Login Page

router.get("/admin/login", (req, res) => {

    res.render("admin/login");

});


// Admin Login

router.post("/admin/login", adminLoginController);


// Admin Dashboard

router.get("/admin/dashboard",
    isAdmin,
    adminController.dashboard);

// Admin Logout

router.get("/admin/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            return res
                .status(500)
                .send("Unable to logout");

        }

        res.redirect("/admin/login");

    });

});

router.post(
    "/admin/users/:id/status",
    isAdmin,
    adminUserController.updateUserStatus
);


module.exports = router;