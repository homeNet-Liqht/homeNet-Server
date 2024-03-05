const express = require("express");
const upload = require("../helpers/multer");


const familyGroupControllers = require("../controllers/familyGroup");

const familyGroupRoute = express.Router();

familyGroupRoute.post(
  "/create",
  upload.single("image"),
  familyGroupControllers.create
);

module.exports = familyGroupRoute;