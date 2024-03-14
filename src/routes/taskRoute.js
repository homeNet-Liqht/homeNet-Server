const express = require("express");
const taskController = require("../controllers/task");
const upload = require("../helpers/multer");
const { checkAuthorization } = require("../middlewares/checkAuthor");

const taskRoute = express.Router();

taskRoute.get("/single/:tid", taskController.getTask);
taskRoute.get("/all", taskController.getTasks);
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
taskRoute.delete("/del/:uid/:tid", checkAuthorization, taskController.delete);
module.exports = taskRoute;
