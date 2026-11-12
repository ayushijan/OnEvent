const service = require("../../services/user/forgotPasswordService");

const forgotPassword = async (req, res) => {
    try {
        const result = await service(req.body);

        req.session.resetEmail = result.email;
        req.session.resetVerified = false;
        req.session.forgotOtpSentAt = Date.now();

        return req.session.save((error) => {
            if (error) {
                console.error("Forgot password session save error:", error);
                return res.status(500).render("user/forgotPassword", {
                    errorMessage: "Unable to start password reset. Please try again."
                });
            }

            return res.status(200).render("user/verifyForgotOtp", {
                email: result.email,
                resendWaitSeconds: 60
            });
        });
    } catch (error) {
        return res.status(error.statusCode || 500).render("user/forgotPassword", {
            errorMessage: error.message
        });
    }
};

module.exports = forgotPassword;
