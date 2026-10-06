const service = require("../../services/user/resetPasswordService");

const resetPassword = async (req, res) => {

    try {

        const result = await service(req.body, req.session);

        res.status(200).send(`
            <h1>${result.message}</h1>
            <a href="/login">Go to Login</a>
        `);

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }

};

module.exports = resetPassword;