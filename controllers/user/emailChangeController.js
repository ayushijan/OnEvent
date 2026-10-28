const service = require("../../services/user/emailChangeService");

const sendEmailChangeOtp = async (req, res) => {
    try {
        // Check authentication.
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again."
            });
        }

        // Read and normalize the email address.
        const email = String(
            req.body.newEmail || req.body.email || ""
        ).trim().toLowerCase();

        // Validate required input.
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter your new email address."
            });
        }

        // Validate email format.
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Generate and send the OTP.
        const result = await service(
            req.session.userId,
            email
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
            email: result.email
        });

    } catch (error) {
        console.error("Send email-change OTP error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Unable to send OTP. Please try again."
        });
    }
};

module.exports = sendEmailChangeOtp;

