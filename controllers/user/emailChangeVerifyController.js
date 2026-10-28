const service = require("../../services/user/emailChangeVerifyService");

const verifyEmailChangeOtp = async (req, res) => {

    // Prevent caching of the verification page.
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "Pragma": "no-cache",
        "Expires": "0"
    });

    // Ensure the user is authenticated.
    if (!req.session || !req.session.userId) {
        return res.redirect(303, "/login");
    }

    const email = String(req.body.email || "")
        .trim()
        .toLowerCase();

    const otp = String(req.body.otp || "").trim();

    try {

        // Verify OTP and update the email through the service.
        await service(req.session.userId, email, otp);

        // Verification successful.
        return res.redirect(303, "/profile");

    } catch (error) {

        console.error("Email verification failed:", error.message);

        // Render the verification page with the error.
        return res.status(error.statusCode || 400).render(
            "user/verifyEmailChangeOtp",
            {
                email: email,
                errorMessage: error.message || "Unable to verify your email.",
                successMessage: ""
            }
        );
    }
};

module.exports = verifyEmailChangeOtp;

