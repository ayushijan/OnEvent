const service = require("../../services/user/changePasswordService");


const changePassword = async (req, res) => {

    try {

        const result = await service(
            req.session.userId,
            req.body
        );

        res.status(200).send(`
            <h1>${result.message}</h1>
            <a href="/profile">Go to Profile</a>
        `);

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }

};


module.exports = changePassword;