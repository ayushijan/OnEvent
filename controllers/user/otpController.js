const service = require("../../services/user/otpService");

// =====================================
// RESEND SIGNUP OTP
// =====================================
const resendOtp = async (req, res) => {
    try {
        const result = await service.resendOtp(req.body.email);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// =====================================
// VERIFY SIGNUP OTP
// =====================================
const verifyOtp = async (req, res, next) => {
    try {
        const result = await service.verifyOtp(req.body.email, req.body.otp);

        req.session.regenerate((error) => {
            if (error) return next(error);

            req.session.userId = result.userId;
            req.session.role = "user";

            req.session.save((saveError) => {
                if (saveError) return next(saveError);

                res.set({
                    "Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
                    "Pragma": "no-cache",
                    "Expires": "0"
                });
                return res.status(200).json(result);
            });
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Unable to verify OTP."
        });
    }
};

// =====================================
// VERIFY FORGOT PASSWORD OTP
// =====================================
const verifyForgotPasswordOtp = async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    try {
        if (!req.session.resetEmail || req.session.resetEmail !== email || req.session.resetVerified === true) {
            return res.status(400).render("user/forgotPassword", {
                errorMessage: "Your password reset session has expired. Please start again."
            });
        }

        const result = await service.verifyForgotPasswordOtp(email, otp);
        req.session.resetEmail = result.email;
        req.session.resetVerified = true;

        return req.session.save((error) => {
            if (error) {
                console.error("Reset verification session save error:", error);
                return res.status(500).render("user/verifyForgotOtp", {
                    email,
                    errorMessage: "Unable to continue. Please try again."
                });
            }
            return res.status(200).render("user/resetPassword", {
                email: result.email,
                errorMessage: null
            });
        });
    } catch (error) {
        return res.status(error.statusCode || 400).render("user/verifyForgotOtp", {
            email,
            errorMessage: error.message || "Invalid OTP. Please try again.",
            resendWaitSeconds: Math.max(0, 60 - Math.floor((Date.now() - (req.session.forgotOtpSentAt || 0)) / 1000))
        });
    }
};

// =====================================
// RESEND FORGOT PASSWORD OTP
// =====================================
const resendForgotPasswordOtp = async (req, res) => {
    try {
        const email = req.session.resetEmail;

        if (!email || req.session.resetVerified === true) {
            return res.status(400).json({
                message: "Your password reset session has expired. Please start again."
            });
        }

        const lastSentAt = Number(req.session.forgotOtpSentAt || 0);
        const remainingMs = 60000 - (Date.now() - lastSentAt);

        if (remainingMs > 0) {
            return res.status(429).json({
                message: `Please wait ${Math.ceil(remainingMs / 1000)} seconds before requesting another OTP.`,
                remainingSeconds: Math.ceil(remainingMs / 1000)
            });
        }

        const result = await service.resendForgotPasswordOtp(email);
        req.session.forgotOtpSentAt = Date.now();

        return req.session.save((error) => {
            if (error) {
                console.error("Resend OTP session save error:", error);
                return res.status(500).json({ message: "Unable to update your session. Please try again." });
            }
            return res.status(200).json({ ...result, remainingSeconds: 60 });
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Unable to resend OTP."
        });
    }
};

module.exports = {
    resendOtp,
    verifyOtp,
    verifyForgotPasswordOtp,
    resendForgotPasswordOtp
};
