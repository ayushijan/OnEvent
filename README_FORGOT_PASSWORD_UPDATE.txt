OnEvent - Forgot Password OTP Flow Update

Implemented in this project archive:
- Initial forgot-password request stores the reset email and OTP send time in the session.
- Forgot-password OTP verification checks the reset session and moves to the password form.
- Resend OTP endpoint uses the session email and enforces a 60-second server-side cooldown.
- Resend OTP updates the existing forgotPassword OTP record rather than creating a duplicate.
- Password reset form validates password and confirmation through the existing reset service.
- Successful password reset renders views/user/passwordResetSuccess.ejs.

Setup:
1. Extract this project folder.
2. Create/copy your own .env file into the OnEvent project root. The archive intentionally does not include secrets.
3. Run npm install.
4. Run the application using the start script in package.json.
5. Test using an account that can receive email through the project's configured email service.

Note: node_modules and the local .git history are not included in this archive.
