let timeLeft = 59;

const timer = document.querySelector(".timer");

const resendButton = document.querySelector(".resend-btn");

const email = document.querySelector('input[name="email"]').value;

const otpBoxes = document.querySelectorAll(".otp-box");

const otpForm = document.querySelector("#otpForm");

const otpValue = document.querySelector("#otpValue");

let countdown = null;


/* =====================================================
   START 59 SECOND TIMER
===================================================== */

function startTimer() {

    // Stop any previous timer
    if (countdown !== null) {

        clearInterval(countdown);

    }


    // Always start from 59 seconds
    timeLeft = 59;

    resendButton.disabled = true;

    timer.textContent = "00:59";


    countdown = setInterval(() => {

        timeLeft--;


        if (timeLeft <= 0) {

            clearInterval(countdown);

            countdown = null;

            timeLeft = 0;

            timer.textContent = "00:00";

            resendButton.disabled = false;

            return;

        }


        timer.textContent =
            `00:${timeLeft.toString().padStart(2, "0")}`;

    }, 1000);

}


/* =====================================================
   INITIAL TIMER
===================================================== */

startTimer();


/* =====================================================
   OTP INPUT
===================================================== */

otpBoxes.forEach((box, index) => {


    box.addEventListener("input", () => {

        box.value = box.value.replace(/\D/g, "");


        if (
            box.value &&
            index < otpBoxes.length - 1
        ) {

            otpBoxes[index + 1].focus();

        }

    });


    box.addEventListener("keydown", (event) => {

        if (
            event.key === "Backspace" &&
            !box.value &&
            index > 0
        ) {

            otpBoxes[index - 1].focus();

        }

    });


    box.addEventListener("paste", (event) => {

        event.preventDefault();


        const pastedValue =
            event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 6);


        pastedValue.split("").forEach((digit, i) => {

            if (otpBoxes[i]) {

                otpBoxes[i].value = digit;

            }

        });


        if (pastedValue.length > 0) {

            const nextIndex =
                Math.min(
                    pastedValue.length,
                    otpBoxes.length - 1
                );

            otpBoxes[nextIndex].focus();

        }

    });

});


/* =====================================================
   RESEND OTP
===================================================== */

resendButton.addEventListener("click", async () => {

    try {

        resendButton.disabled = true;


        const response = await fetch("/resend-otp", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email
            })

        });


        const result = await response.json();


        if (!response.ok) {

            alert(result.message);

            resendButton.disabled = false;

            return;

        }


        console.log("New OTP sent");


        // Restart timer from exactly 59 seconds
        startTimer();


    } catch (error) {

        console.log(error);

        alert("Something went wrong. Please try again.");

        resendButton.disabled = false;

    }

});


/* =====================================================
   VERIFY OTP
===================================================== */

otpForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    let otp = "";


    otpBoxes.forEach((box) => {

        otp += box.value;

    });


    if (otp.length !== 6) {

        alert("Please enter the 6-digit OTP");

        return;

    }


    otpValue.value = otp;


    try {

        const response = await fetch("/verify-otp", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: email,

                otp: otp

            })

        });


        const result = await response.json();


        if (!response.ok) {

            alert(result.message);

            return;

        }


        window.location.href = "/";


    } catch (error) {

        console.log(error);

        alert("Something went wrong. Please try again.");

    }

});