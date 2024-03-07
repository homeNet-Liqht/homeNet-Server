const express = require("express");
const taskController = require("../controllers/task");
const upload = require("../helpers/multer");
const { checkAuthorization } = require("../middlewares/checkAuthor");

const taskRoute = express.Router();

taskRoute.post(
  "/create",
  upload.fields([{ name: "image" }]),
  taskController.create
);

taskRoute.put(
  "/edit/:uid/:tid",
  upload.fields([{ name: "image" }]),
  checkAuthorization,
  taskController.edit
);

module.exports = taskRoute;
