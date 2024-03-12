const express = require("express");
const { checkAuthentication } = require("../middlewares/checkAuthen");
const userController = require("../controllers/user");
const { checkAuthorization } = require("../middlewares/checkAuthor");
const upload = require("../helpers/multer");

const userRoute = express.Router();

userRoute.get("/current-user", checkAuthentication, userController.currentUser);
userRoute.put(
  "/update-info/:uid",
  checkAuthentication,
  checkAuthorization,
  userController.editInformation
);
userRoute.put(
  "/profile-image/:uid",
  checkAuthentication,
  checkAuthorization,
  upload.single("image"),

  userController.editImage
);
userRoute.put(
  "/update-fcmtoken/:uid",
  checkAuthentication,
  checkAuthorization,
  userController.updateFcmToken
);
userRoute.post("/reset-password", userController.updatePassword);

module.exports = userRoute;
