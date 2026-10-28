const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
});

const sendOtp = async (email, otp) => {
    try {

        // Check email configuration.
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error(
                "Email configuration is missing. Check EMAIL_USER and EMAIL_PASS."
            );
        }

        if (!email || !otp) {
            throw new Error(
                "Recipient email and OTP are required."
            );
        }

        const mailOptions = {
            from: {
                name: "OnEvent",
                address: process.env.EMAIL_USER
            },

            to: email,

            subject: "Your OnEvent Verification Code",

            text: `Your OnEvent verification code is ${otp}. This code is valid for 5 minutes. If you did not request this code, please ignore this email.`,

            html: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:20px auto;padding:30px;border:1px solid #e9e7ff;border-radius:12px;color:#18213b;">

                    <h2 style="color:#5546e8;">OnEvent</h2>

                    <h3>Verify Your Email</h3>

                    <p>
                        Use the following code to verify your new email address.
                    </p>

                    <div style="background:#eeecff;color:#5546e8;font-size:30px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;border-radius:8px;margin:24px 0;">
                        ${otp}
                    </div>

                    <p>
                        This code is valid for <strong>5 minutes</strong>.
                    </p>

                    <p style="color:#77778d;font-size:12px;">
                        If you did not request this code, please ignore this email.
                    </p>

                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("========== OTP EMAIL RESULT ==========");
        console.log("Recipient:", email);
        console.log("Sender:", process.env.EMAIL_USER);
        console.log("Message ID:", info.messageId);
        console.log("Accepted:", info.accepted);
        console.log("Rejected:", info.rejected);
        console.log("======================================");

        // Ensure the recipient was accepted.
        if (
            !info.accepted ||
            !info.accepted.some(
                address => address.toLowerCase() === email.toLowerCase()
            )
        ) {
            throw new Error(
                "The email provider did not accept the recipient."
            );
        }

        return info;

    } catch (error) {

        console.error("OTP EMAIL ERROR:", {
            message: error.message,
            code: error.code,
            response: error.response,
            command: error.command
        });

        throw error;
    }
};

module.exports = sendOtp;
