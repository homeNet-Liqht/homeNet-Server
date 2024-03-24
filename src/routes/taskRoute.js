const express = require("express");
const taskController = require("../controllers/task");
const upload = require("../helpers/multer");
const { checkAuthorization } = require("../middlewares/checkAuthor");

const taskRoute = express.Router();

taskRoute.get("/user-task/:uid", taskController.getTaskById);
taskRoute.get("/current-user-tasks", taskController.currentUserTask);
taskRoute.get("/single/:tid", taskController.getTask);
taskRoute.get("/tasks", taskController.getTasks);
taskRoute.post(

  "/user-tasks-in-day",
  taskController.getTasksInDayWithCurrentUser
);
taskRoute.post("/tasks-in-day", taskController.getTasksInDay);

taskRoute.post(
  "/create",
  upload.fields([{ name: "image" }]),
  taskController.create
);

taskRoute.post(
  "/upload-edit-image",
  upload.fields([{ name: "image" }]),
  taskController.uploadEditImage
);
taskRoute.put("/edit/:uid/:tid", checkAuthorization, taskController.edit);
taskRoute.delete("/del/:uid/:tid", checkAuthorization, taskController.delete);
module.exports = taskRoute;
