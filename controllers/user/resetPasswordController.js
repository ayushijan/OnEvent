const service = require("../../services/user/resetPasswordService");

const resetPassword = async (req, res) => {
    try {
        if (!req.session.resetEmail || req.session.resetVerified !== true) {
            return res.status(403).render("user/forgotPassword", {
                errorMessage: "Please verify your OTP before resetting your password."
            });
        }

        // Use the email stored in the verified session, not a client-submitted email.
        const result = await service({
            email: req.session.resetEmail,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        }, req.session);

        delete req.session.resetEmail;
        delete req.session.resetVerified;
        delete req.session.forgotOtpSentAt;

        return req.session.save((error) => {
            if (error) {
                console.error("Password reset session cleanup error:", error);
            }
            return res.status(200).render("user/passwordResetSuccess", {
                message: result.message
            });
        });
    } catch (error) {
        return res.status(error.statusCode || 400).render("user/resetPassword", {
            email: req.session.resetEmail,
            errorMessage: error.message || "Unable to reset password. Please try again."
        });
    }
};

module.exports = resetPassword;
