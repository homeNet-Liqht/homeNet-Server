const express = require("express");
const taskController = require("../controllers/task");
const upload = require("../helpers/multer");

const taskRoute = express.Router();

taskRoute.post(
  "/create",
  upload.fields([{ name: "image" }]),
  taskController.create
);

module.exports = taskRoute;
