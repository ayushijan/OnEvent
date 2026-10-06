const express = require("express");
const router = express.Router();

const userController = require("../controllers/user/userController");

const otpController = require("../controllers/user/otpController");

const isAuthenticated = require("../middleware/auth");

const loginController = require("../controllers/user/loginController");

const forgotPasswordController = require("../controllers/user/forgotPasswordController");

const resetPasswordController = require("../controllers/user/resetPasswordController");

const profileController = require("../controllers/user/profileController");

const profileService = require("../services/user/profileService");

const emailChangeController = require("../controllers/user/emailChangeController");

const emailChangeVerifyController = require("../controllers/user/emailChangeVerifyController");

const changePasswordController = require("../controllers/user/changePasswordController");

const upload = require("../middleware/upload");

const passport = require("../config/passport");


// Signup

router.post("/signup", userController);


// Signup OTP

router.post("/resend-otp", otpController.resendOtp);

router.post("/verify-otp", otpController.verifyOtp);


// Login

router.post("/login", loginController);


// Forgot Password

router.post("/forgot-password", forgotPasswordController);

router.post(
    "/verify-forgot-otp",
    otpController.verifyForgotPasswordOtp
);

router.post("/reset-password", resetPasswordController);


// Email Change

router.post(
    "/profile/change-email",
    isAuthenticated,
    emailChangeController
);

router.post(
    "/profile/change-email/verify",
    isAuthenticated,
    emailChangeVerifyController
);


// Home

router.get("/", isAuthenticated, async (req, res) => {

    try {

        const user = await profileService(req.session.userId);

        res.render("user/home", {
            user: user
        });

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }

});


// Signup Page

router.get("/signup", (req, res) => {

    res.render("user/signup");

});


// Login Page

router.get("/login", (req, res) => {

    res.render("user/login", {
        blocked: req.query.blocked === "true"
    });

});


// Forgot Password Page

router.get("/forgot-password", (req, res) => {

    res.render("user/forgotPassword");

});


// Profile

router.get(
    "/profile",
    isAuthenticated,
    profileController.getProfile
);


// Edit Profile

router.get(
    "/profile/edit",
    isAuthenticated,
    profileController.editProfilePage
);

router.post(
    "/profile/edit",
    isAuthenticated,
    profileController.editProfile
);


// Profile Image Upload

router.post(
    "/profile/upload-image",
    isAuthenticated,
    upload.single("profileImage"),
    profileController.uploadProfileImage
);


// Change Password Page

router.get(
    "/profile/change-password",
    isAuthenticated,
    async (req, res) => {

        try {

            const user = await profileService(
                req.session.userId
            );

            res.render("user/changePassword", {
                user: user
            });

        } catch (error) {

            res.status(error.statusCode || 500)
                .send(error.message);

        }

    }
);


// Change Password

router.post(
    "/profile/change-password",
    isAuthenticated,
    changePasswordController
);


// Logout

router.get("/logout", (req, res) => {

    req.session.userId = null;
    req.session.role = null;

    res.redirect("/login");

});


// Google Login

router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);


// Google Callback

router.get(
    "/auth/google/callback",
    (req, res, next) => {

        passport.authenticate(
            "google",
            { session: false },
            (error, user, info) => {

                if (error) {
                    return next(error);
                }

                if (!user) {

                    if (info && info.message === "blocked") {
                        return res.redirect("/login?blocked=true");
                    }

                    return res.redirect("/login");
                }

                req.session.userId = user._id;
                req.session.role = user.role;

                res.redirect("/");
            }
        )(req, res, next);

    }
);


module.exports = router;