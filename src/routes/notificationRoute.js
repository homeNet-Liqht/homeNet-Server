const express = require("express");
const notificationController = require("../controllers/notification");

const notificationRoute = express.Router();

notificationRoute.post("/send", notificationController.sending);

module.exports = notificationRoute;
