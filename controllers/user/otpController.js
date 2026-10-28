const service = require("../../services/user/otpService");

const resendOtp = async (req, res) => {

    try {

        const email = req.body.email;

        const result = await service.resendOtp(email);

        res.status(200).json(result);

    } catch (error) {

        res.status(error.statusCode || 500).json({
            message: error.message
        });

    }

};

const verifyOtp = async (req, res, next) => {
try {
const email = req.body.email;
const otp = req.body.otp;
const result = await service.verifyOtp(email, otp);

    req.session.regenerate((error) => {
        if (error) {
            return next(error);
        }

        req.session.userId = result.userId;
        req.session.role = "user";

        req.session.save((saveError) => {
            if (saveError) {
                return next(saveError);
            }

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


const verifyForgotPasswordOtp = async (req, res) => {

    try {

        const email = req.body.email;

        const otp = req.body.otp;

        const result = await service.verifyForgotPasswordOtp(
            email,
            otp
        );

        req.session.resetEmail = result.email;
        req.session.resetVerified = true;

        res.status(200).render("user/resetPassword", {
            email: result.email
        });

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }

};

module.exports = {

    resendOtp,

    verifyOtp,

    verifyForgotPasswordOtp
    
};