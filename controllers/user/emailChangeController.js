const service = require("../../services/user/emailChangeService");

const sendEmailChangeOtp = async (req, res) => {

    try {

        const result = await service(
            req.session.userId,
            req.body.email
        );

        res.status(200).render("user/verifyEmailChangeOtp", {
            email: result.email
        });

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }
};

module.exports = sendEmailChangeOtp;