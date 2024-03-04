const express = require("express");
const {
    authController
} = require("../controllers/auth");
const {
    checkAuthentication
} = require("../middlewares/checkAuthen");
const otpConfirmation = require("../middlewares/otpConfirmation");

const authRoute = express.Router();

authRoute.post("/otp/resend", authController.resendOtpNewUser);
authRoute.post("/otp/password", authController.forgotPassword);
authRoute.post("/otp/verify", otpConfirmation, authController.validAccount);
authRoute.post("/refresh", authController.requestRefreshToken);
authRoute.post("/logout", checkAuthentication, authController.logOut);
authRoute.post("/signin-with-google", authController.signInWithGoogle);
authRoute.post("/signin", authController.signIn);
authRoute.post("/signup", authController.signUp);

module.exports = authRoute;