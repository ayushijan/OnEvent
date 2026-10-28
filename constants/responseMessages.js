const RESPONSE_MESSAGES = Object.freeze({
    SUCCESS: "Operation successful",
    CREATED: "Created successfully",
    BAD_REQUEST: "Invalid request",
    UNAUTHORIZED: "Authentication required",
    FORBIDDEN: "Access denied",
    NOT_FOUND: "Resource not found",
    INTERNAL_SERVER_ERROR: "Internal server error",

    NAME_REQUIRED: "Name is required",
    INVALID_NAME: "Name must contain only letters and spaces",
    EMAIL_REQUIRED: "Email is required",
    PASSWORD_REQUIRED: "Password is required",
    INVALID_PASSWORD: "Current password is wrong",
    PHONE_REQUIRED: "Phone number is required",
    INVALID_PHONE: "Invalid phone number",

    USER_NOT_FOUND: "User not found",
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_BLOCKED: "Account is blocked",

    OTP_INVALID: "Invalid OTP",
    OTP_EXPIRED: "OTP has expired"
});

module.exports = RESPONSE_MESSAGES;