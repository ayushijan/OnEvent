const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOtp = async(email,otp)=>{
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OnEvent OTP",
        text: `Your OnEvent verification code is: ${otp}. This OTP is valid for 5 minutes`
    }
    await transporter.sendMail(mailOptions);
}

module.exports = sendOtp; 