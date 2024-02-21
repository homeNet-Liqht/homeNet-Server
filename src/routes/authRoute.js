const express = require("express");
const {
    authController
} = require("../controllers/auth");
const {
    checkAuthentication
} = require("../middlewares/checkAuthen");

const authRoute = express.Router();


authRoute.post("/otp/password", authController.forgotPassword);
authRoute.post("/refresh", authController.requestRefreshToken);
authRoute.post("/logout", checkAuthentication, authController.logOut);
authRoute.post("/signin", authController.signIn);
authRoute.post("/otp/verify", authController.otpConfirmation);
authRoute.post("/signup", authController.signUp);

module.exports = authRoute;