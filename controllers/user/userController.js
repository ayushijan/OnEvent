const service = require("../../services/user/userService");

const signup = async (req, res) => {
    try {
        const result = await service(req.body);

        return res.status(201).render("user/verifyOtp", {
            email: result.email,
            errorMessage: "",
            successMessage:
                "Signup successful. Please verify your email using the OTP sent to you."
        });

    } catch (error) {
        console.error("Signup error:", error.message);

        const formData = {
            name: req.body.name || "",
            email: req.body.email || "",
            phone: req.body.phone || ""
        };

        // Display duplicate-email errors below the email field.
        const isDuplicateEmail =
            error.statusCode === 409 ||
            /email already (exists|registered|in use)/i.test(error.message);

        if (isDuplicateEmail) {
            return res.status(409).render("user/signup", {
                formData,
                emailError: "Email already registered",
                errorMessage: "",
                successMessage: ""
            });
        }

        // Display other errors in the general error area.
        return res.status(error.statusCode || 500).render("user/signup", {
            formData,
            emailError: "",
            errorMessage: error.statusCode
                ? error.message
                : "Something went wrong. Please try again.",
            successMessage: ""
        });
    }
};

module.exports = signup;
