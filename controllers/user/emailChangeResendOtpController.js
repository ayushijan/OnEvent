const service = require("../../services/user/emailChangeService");

const resendEmailChangeOtp = async (req, res) => {
    // Prevent caching of this response.
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "Pragma": "no-cache",
        "Expires": "0"
    });

    try {
        // Check whether the user is logged in.
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again."
            });
        }

        // Read and normalize the email address.
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter an email address."
            });
        }

        // Generate and send a new OTP.
        const result = await service(
            req.session.userId,
            email
        );

        return res.status(200).json({
            success: true,
            message: `A new verification code has been sent to ${result.email}.`
        });

    } catch (error) {
        console.error("Email-change resend error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Unable to resend the verification code. Please try again."
        });
    }
};

module.exports = resendEmailChangeOtp;
