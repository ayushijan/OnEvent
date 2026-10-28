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
const emailChangeResendOtpController = require("../controllers/user/emailChangeResendOtpController");
const changePasswordController = require("../controllers/user/changePasswordController");
const upload = require("../middleware/upload");
const passport = require("../config/passport");

// ==================== PREVENT CACHE ====================

const preventCache = (req, res, next) => {
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "Pragma": "no-cache",
        "Expires": "0"
    });

    next();
};

// ==================== SIGNUP ====================

router.post("/signup", userController);

// ==================== OTP ====================

router.post("/resend-otp", otpController.resendOtp);

router.post("/verify-otp", otpController.verifyOtp);

// ==================== LOGIN ====================

router.post("/login", loginController);

// ==================== FORGOT PASSWORD ====================

router.post("/forgot-password", forgotPasswordController);

router.post(
    "/verify-forgot-otp",
    otpController.verifyForgotPasswordOtp
);

router.post("/reset-password", resetPasswordController);

// ==================== HOME ====================

router.get("/", isAuthenticated, async (req, res) => {
    try {
        const user = await profileService(req.session.userId);

        if (!user) {
            return req.session.destroy((error) => {
                if (error) {
                    return res.status(500).send("Unable to end session.");
                }

                res.clearCookie("onevent.sid", {
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax"
                });

                return res.redirect(303, "/login");
            });
        }

        return res.render("user/home", {
            user: user
        });
    } catch (error) {
        console.error("Error loading home page:", error);

        return res.status(error.statusCode || 500)
            .send(error.message || "Unable to load the home page.");
    }
});

// ==================== SIGNUP PAGE ====================

router.get("/signup", preventCache, (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect(303, "/");
    }

    return res.render("user/signup");
});

// ==================== LOGIN PAGE ====================

router.get("/login", preventCache, (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect(303, "/");
    }

    return res.render("user/login", {
        blocked: req.query.blocked === "true",
        error: null,
        email: "",
        emailError: null
    });
});

// ==================== FORGOT PASSWORD PAGE ====================

router.get("/forgot-password", preventCache, (req, res) => {
    return res.render("user/forgotPassword");
});

// ==================== PROFILE ====================

router.get(
    "/profile",
    isAuthenticated,
    profileController.getProfile
);

// ==================== EDIT PROFILE ====================

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

// ==================== PROFILE IMAGE ====================

router.post(
    "/profile/upload-image",
    isAuthenticated,
    upload.single("profileImage"),
    profileController.uploadProfileImage
);

router.post(
    "/profile/remove-image",
    isAuthenticated,
    profileController.removeProfileImage
);

// ==================== CHANGE PASSWORD ====================

// Display the Change Password page.

router.get(
    "/profile/change-password",
    isAuthenticated,
    async (req, res) => {
        try {
            const user = await profileService(req.session.userId);

            if (!user) {
                return res.redirect(303, "/login");
            }

            // Google users cannot change passwords here.
            if (user.authProvider === "google") {
                return res.redirect(303, "/profile");
            }

            res.set({
                "Cache-Control": "no-store, no-cache, must-revalidate, private",
                "Pragma": "no-cache",
                "Expires": "0"
            });

            return res.render("user/changePassword", {
                user: user,
                successMessage: "",
                errorMessage: ""
            });
        } catch (error) {
            console.error("Error loading Change Password page:", error);

            return res.status(error.statusCode || 500)
                .send(error.message || "Unable to load Change Password page.");
        }
    }
);

// Process password change.

router.post(
    "/profile/change-password",
    isAuthenticated,
    changePasswordController
);

// ==================== CHANGE EMAIL ====================

// Send OTP to the new email address.

router.post(
    "/profile/change-email",
    isAuthenticated,
    emailChangeController
);

// Display the email-change OTP verification page.

router.get(
    "/profile/change-email/verify",
    isAuthenticated,
    async (req, res, next) => {
        try {
            const user = await profileService(req.session.userId);

            if (!user) {
                return res.redirect(303, "/login");
            }

            const email = String(req.query.email || "")
                .trim()
                .toLowerCase();

            if (!email) {
                return res.redirect(303, "/profile/edit");
            }

            res.set({
                "Cache-Control": "no-store, no-cache, must-revalidate, private",
                "Pragma": "no-cache",
                "Expires": "0"
            });

            return res.render("user/verifyEmailChangeOtp", {
                email: email,
                errorMessage: "",
                successMessage: ""
            });
        } catch (error) {
            console.error("Error loading email-change OTP page:", error);

            return next(error);
        }
    }
);

// Verify the OTP submitted by the user.

router.post(
    "/profile/change-email/verify",
    isAuthenticated,
    emailChangeVerifyController
);

// Resend email-change OTP.

router.post(
    "/profile/change-email/resend-otp",
    isAuthenticated,
    emailChangeResendOtpController
);

// ==================== LOGOUT ====================

router.post("/logout", preventCache, (req, res, next) => {
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
        return res.redirect(303, "/login");
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

        return res.redirect(303, "/login");
    });
});


// ==================== GOOGLE AUTHENTICATION ====================

// Start Google authentication.

router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

// Handle Google's authentication callback.

router.get(
    "/auth/google/callback",
    (req, res, next) => {
        passport.authenticate(
            "google",
            {
                session: false
            },
            (error, user, info) => {
                if (error) {
                    return next(error);
                }

                if (!user) {
                    if (info && info.message === "blocked") {
                        return res.redirect(303, "/login?blocked=true");
                    }

                    return res.redirect(303, "/login");
                }

                // Regenerate the session after successful authentication.
                req.session.regenerate((sessionError) => {
                    if (sessionError) {
                        return next(sessionError);
                    }

                    req.session.userId = user._id;
                    req.session.role = user.role;

                    req.session.save((saveError) => {
                        if (saveError) {
                            return next(saveError);
                        }

                        res.set({
                            "Cache-Control": "no-store, no-cache, must-revalidate, private",
                            "Pragma": "no-cache",
                            "Expires": "0"
                        });

                        return res.redirect(303, "/");
                    });
                });
            }
        )(req, res, next);
    }
);

// ==================== EXPORT ROUTER ====================

module.exports = router;
