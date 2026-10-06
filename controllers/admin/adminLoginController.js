const service = require("../../services/admin/adminLoginService");


const adminLogin = async (req, res) => {

    try {

        const result = await service(
            req.body.email,
            req.body.password
        );


        req.session.adminId = result.userId;
        req.session.adminRole = result.role;


        res.redirect("/admin/dashboard");

    } catch (error) {

        res.status(error.statusCode || 500)
            .send(error.message);

    }

};


module.exports = adminLogin;