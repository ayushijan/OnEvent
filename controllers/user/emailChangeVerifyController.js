const service = require("../../services/user/emailChangeVerifyService");

const verifyEmailChangeOtp = async (req, res) => {

    try {

        const result = await service(
            req.session.userId,
            req.body.email,
            req.body.otp
        );

        res.status(200).send(`
            <h1>${result.message}</h1>
            <a href="/profile">Go to Profile</a>
        `);

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }

};

module.exports = verifyEmailChangeOtp;