const service = require("../../services/user/loginService");

const login = async (req, res, next) => {
    try {
        const result = await service(req.body);

        // Prevent session fixation by creating a new session.
        req.session.regenerate((error) => {
            if (error) {
                return next(error);
            }

            // Store authentication details.
            req.session.userId = result.userId;
            req.session.role = "user";

            // Save the session before redirecting.
            req.session.save((saveError) => {
                if (saveError) {
                    return next(saveError);
                }

                res.set({
                    "Cache-Control": "no-store, no-cache, must-revalidate, private",
                    "Pragma": "no-cache",
                    "Expires": "0"
                });

                return res.redirect(303, "/");
            });
        });
    } catch (error) {
        res.set({
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "Pragma": "no-cache",
            "Expires": "0"
        });

        if (
            error.statusCode === 403 &&
            error.message === "Your account has been blocked"
        ) {
            return res.redirect(303, "/login?blocked=true");
        }

        return res
            .status(error.statusCode || 500)
            .render("user/login", {
                error: error.message || "Unable to log in. Please try again.",
                email: req.body.email || "",
                emailError: null,
                blocked: false
            });
    }
};

module.exports = login;
