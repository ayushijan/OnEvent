const service = require("../../services/admin/adminLoginService");

const adminLogin = async (req, res, next) => {
    try {
        const result = await service(
            req.body.email,
            req.body.password
        );

        // Regenerate the session after successful authentication
        req.session.regenerate((error) => {
            if (error) {
                return next(error);
            }

            // Store admin authentication details
            req.session.adminId = result.userId;
            req.session.adminRole = result.role;

            // Save the session before redirecting
            req.session.save((saveError) => {
                if (saveError) {
                    return next(saveError);
                }

                // Prevent the dashboard response from being cached
                res.set({
                    "Cache-Control": "no-store, no-cache, must-revalidate, private",
                    "Pragma": "no-cache",
                    "Expires": "0"
                });

                return res.redirect(303, "/admin/dashboard");
            });
        });

    } catch (error) {
        // Prevent the error response from being cached
        res.set({
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "Pragma": "no-cache",
            "Expires": "0"
        });

        // Handle expected login and validation errors
        if ([400, 401, 403].includes(error.statusCode)) {
            const message =
                error.statusCode === 400
                    ? "Email and password are required"
                    : "Invalid email or password";

            return res.status(error.statusCode).render("admin/login", {
                error: message,
                email: req.body.email || ""
            });
        }

        // Pass unexpected errors to the error-handling middleware
        return next(error);
    }
};

module.exports = adminLogin;
