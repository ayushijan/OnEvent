const service = require("../../services/user/changePasswordService");
const profileService = require("../../services/user/profileService");

const changePassword = async (req, res) => {
    // Prevent the browser from caching the password page.
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "Pragma": "no-cache",
        "Expires": "0"
    });

    // Check whether the user is logged in.
    if (!req.session || !req.session.userId) {
        return res.redirect(303, "/login");
    }

    try {
        // Change the password.
        const result = await service(
            req.session.userId,
            req.body
        );

        // Reload the user's latest profile details.
        const user = await profileService(req.session.userId);

        if (!user) {
            return res.redirect(303, "/login");
        }

        // Display the success message on the same page.
        return res.status(200).render("user/changePassword", {
            user,
            successMessage:
                result.message || "Password changed successfully.",
            errorMessage: ""
        });

    } catch (error) {
        console.error("Change password error:", error);

        try {
            // Reload the profile so the page can be rendered again.
            const user = await profileService(req.session.userId);

            if (!user) {
                return res.redirect(303, "/login");
            }

            // Display the error message on the same page.
            return res.status(200).render("user/changePassword", {
                user,
                successMessage: "",
                errorMessage:
                    error.message ||
                    "Unable to change password. Please try again."
            });

        } catch (renderError) {
            console.error(
                "Error loading Change Password page:",
                renderError
            );

            return res.status(500).send(
                "Unable to load the Change Password page. Please try again."
            );
        }
    }
};

module.exports = changePassword;
