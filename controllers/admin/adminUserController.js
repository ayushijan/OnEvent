const service = require("../../services/admin/adminUserService");


const updateUserStatus = async (req, res) => {

    try {

        await service(
            req.params.id,
            req.body.status
        );

        res.redirect("/admin/dashboard");

    } catch (error) {

        res.status(error.statusCode || 500)
            .send(error.message);

    }

};


module.exports = {
    updateUserStatus
};