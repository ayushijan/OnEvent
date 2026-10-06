const passwordInput = document.querySelector("#password");

const passwordEye = document.querySelector("#passwordEye");


passwordEye.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        passwordEye.src = "/icons/eye.svg";

        passwordEye.alt = "Hide password";

    } else {

        passwordInput.type = "password";

        passwordEye.src = "/icons/eye-off.svg";

        passwordEye.alt = "Show password";

    }

});