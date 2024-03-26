const express = require("express");
const notificationController = require("../controllers/notification");

const notificationRoute = express.Router();


notificationRoute.post("/send", notificationController.sending);
notificationRoute.get("/show", notificationController.show);

module.exports = notificationRoute;
