const signupForm = document.getElementById("signupForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput =
    document.getElementById("confirmPassword");
const termsInput = document.getElementById("terms");


const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError =
    document.getElementById("confirmPasswordError");
const termsError = document.getElementById("termsError");


// ===============================
// CLEAR ERROR MESSAGES
// ===============================

function clearErrors() {

    nameError.textContent = "";
    emailError.textContent = "";
    phoneError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    termsError.textContent = "";

}


// ===============================
// SIGNUP VALIDATION
// ===============================

signupForm.addEventListener("submit", function (event) {

    event.preventDefault();

    clearErrors();

    let isValid = true;


    // Name validation
    if (!nameInput.value.trim()) {

        nameError.textContent =
            "Name is required";

        isValid = false;

    }


    // Email validation
    const email = emailInput.value.trim();

    if (!email) {

        emailError.textContent =
            "Email is required";

        isValid = false;

    }
    else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        emailError.textContent =
            "Please enter a valid email address";

        isValid = false;

    }


    // Phone validation
    const phone = phoneInput.value.trim();

    if (!phone) {

        phoneError.textContent =
            "Phone number is required";

        isValid = false;

    }
    else if (!/^[0-9]{10}$/.test(phone)) {

        phoneError.textContent =
            "Phone number must contain 10 digits";

        isValid = false;

    }


    // Password validation
    const password = passwordInput.value;

    if (!password) {

        passwordError.textContent =
            "Password is required";

        isValid = false;

    }
    else if (password.length < 8) {

        passwordError.textContent =
            "Password must be at least 8 characters";

        isValid = false;

    }
    else if (!/[A-Z]/.test(password)) {

        passwordError.textContent =
            "Password must contain at least one uppercase letter";

        isValid = false;

    }
    else if (!/[a-z]/.test(password)) {

        passwordError.textContent =
            "Password must contain at least one lowercase letter";

        isValid = false;

    }
    else if (!/[0-9]/.test(password)) {

        passwordError.textContent =
            "Password must contain at least one number";

        isValid = false;

    }
    else if (!/[^A-Za-z0-9]/.test(password)) {

        passwordError.textContent =
            "Password must contain at least one special character";

        isValid = false;

    }


    // Confirm password validation
    const confirmPassword =
        confirmPasswordInput.value;

    if (!confirmPassword) {

        confirmPasswordError.textContent =
            "Please confirm your password";

        isValid = false;

    }
    else if (password !== confirmPassword) {

        confirmPasswordError.textContent =
            "Passwords do not match";

        isValid = false;

    }


    // Terms validation
    if (!termsInput.checked) {

        termsError.textContent =
            "Please accept the Terms & Conditions";

        isValid = false;

    }


    // Submit if everything is valid
    if (isValid) {

        signupForm.submit();

    }

});


// ===============================
// CLEAR ERROR WHEN USER TYPES
// ===============================

nameInput.addEventListener("input", function () {
    nameError.textContent = "";
});

emailInput.addEventListener("input", function () {
    emailError.textContent = "";
});

phoneInput.addEventListener("input", function () {
    phoneError.textContent = "";
});

passwordInput.addEventListener("input", function () {
    passwordError.textContent = "";
});

confirmPasswordInput.addEventListener("input", function () {
    confirmPasswordError.textContent = "";
});

termsInput.addEventListener("change", function () {
    termsError.textContent = "";
});


// ===============================
// BROWSER BACK / BF CACHE
// ===============================
//
// When the signup page is restored from
// browser history, clear the previous values.
//
// Email autocomplete is NOT disabled.
// Typing "adm" can still show saved suggestions.
//

window.addEventListener("pageshow", function (event) {

    if (event.persisted) {

        nameInput.value = "";

        emailInput.value = "";

        phoneInput.value = "";

        passwordInput.value = "";

        confirmPasswordInput.value = "";

        termsInput.checked = false;

        clearErrors();

    }

});