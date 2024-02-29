const express = require("express");
const {
    checkAuthentication
} = require("../middlewares/checkAuthen");
const {
    userController
} = require("../controllers/user");
const {
    checkAuthorization
} = require("../middlewares/checkAuthor");

const userRoute = express.Router();

userRoute.get("/current-user/:uid", userController.currentUser);
userRoute.put("/update-info/:uid", checkAuthentication, checkAuthorization, userController.editInformation);
userRoute.post("/reset-password", userController.updatePassword)

module.exports = userRoute;