const express = require("express");
const { authController } = require("../controllers/auth");

const authRoute = express.Router();
authRoute.post("/signin", authController.signIn);
authRoute.post("/otp/verify", authController.otpConfirmation);
authRoute.post("/signup", authController.signUp);

module.exports = authRoute;
