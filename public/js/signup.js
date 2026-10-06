const passwordEye= document.getElementById("passwordEye");

passwordEye.addEventListener("click",()=>{
    const passwordInput= document.getElementById("password");
    if(passwordInput.type === "password"){
        passwordInput.type="text";
        passwordEye.src = "/icons/eye.svg";
    }else{
        passwordInput.type="password";
        passwordEye.src = "/icons/eye-off.svg";
    }
});

const confirmpasswordEye= document.getElementById("confirmpasswordEye");

confirmpasswordEye.addEventListener("click",()=>{
    const passwordInput= document.getElementById("confirmPassword");
    if(passwordInput.type === "password"){
        passwordInput.type="text";
        confirmpasswordEye.src = "/icons/eye.svg";
    }else{
        passwordInput.type="password";
        confirmpasswordEye.src = "/icons/eye-off.svg";
    }
});

const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit",(event)=>{
    event.preventDefault();
    const password=document.getElementById("password").value;
    const confirmPassword=document.getElementById("confirmPassword").value;
    if(password.length <8){
        alert("Password must be at least 8 characters");
        return;
    }
    if(!/[A-Z]/.test(password)){
        alert("Password must contain at least one uppercase letter");
        return;
    }
    if(!/[a-z]/.test(password)){
        alert("Password must contain at least one lowercase");
        return;
    }
    if(!/[0-9]/.test(password)){
        alert("Password must contain at least one number");
        return;
    }
    if(!/[^A-Za-z0-9]/.test(password)){
        alert("Password must contain at least one special character");
        return;
    }
    if(password === confirmPassword){
        event.target.submit();
    }else{
        alert("Passwords do not match")
    }
})

