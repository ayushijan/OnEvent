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

const verifyOtp = async (req, res) => {

    try {

        const email = req.body.email;

        const otp = req.body.otp;

        const result = await service.verifyOtp(email, otp);

        req.session.userId = result.userId;

        res.status(200).json(result);

    } catch (error) {

        res.status(error.statusCode || 500).json({
            message: error.message
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