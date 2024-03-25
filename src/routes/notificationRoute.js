const express = require("express");
const notificationController = require("../controllers/notification");

const notificationRoute = express.Router();


notificationRoute.get("/show", notificationController.show);
notificationRoute.post("/send", notificationController.sending);

module.exports = notificationRoute;
