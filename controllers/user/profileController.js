const service = require("../../services/user/profileService");

const editProfileService = require("../../services/user/editProfileService");

const User = require("../../models/User");

const getProfile = async (req, res) => {

    try {

        const user = await service(req.session.userId);

        res.status(200).render("user/profile", {
            user: user
        });

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }

};


const editProfilePage = async (req, res) => {

    try {

        const user = await service(req.session.userId);

        res.status(200).render("user/editProfile", {
            user: user
        });

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }

};


const editProfile = async (req, res) => {

    try {

        await editProfileService(
            req.session.userId,
            req.body
        );

        res.redirect("/profile");

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message);

    }

};


const uploadProfileImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).send("Please select an image");

        }

        const user = await User.findById(req.session.userId);

        if (!user) {

            return res.status(404).send("User not found");

        }

        user.profileImage = "/uploads/" + req.file.filename;

        await user.save();

        res.redirect("/profile");

    } catch (error) {

        res.status(500).send(error.message);

    }

};


module.exports = {
    getProfile,
    editProfilePage,
    editProfile,
    uploadProfileImage
};