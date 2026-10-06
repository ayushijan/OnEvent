const service = require("../../services/user/loginService");

const login = async (req, res) => {

    try {

        const result = await service(req.body);

        req.session.userId = result.userId;
        req.session.role = "user";

        res.redirect("/");

    } catch (error) {

        if (
            error.statusCode === 403 &&
            error.message === "Your account has been blocked"
        ) {
            return res.redirect("/login?blocked=true");
        }

        res.status(error.statusCode || 500)
            .send(error.message);
    }

};

module.exports = login;