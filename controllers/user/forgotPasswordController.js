const service = require("../../services/user/forgotPasswordService");

const forgotPassword = async (req, res) => {

    try {

        const result = await service(req.body);

        res.status(200).render("user/verifyForgotOtp", {
            email: result.email
        });

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }

};

module.exports = forgotPassword;