const express = require("express");
const upload = require("../helpers/multer");

const familyGroupControllers = require("../controllers/familyGroup");
const { checkAuthorization } = require("../middlewares/checkAuthor");

const familyGroupRoute = express.Router();

familyGroupRoute.get("/",familyGroupControllers.getFamilyGroup);
familyGroupRoute.post(
  "/create",
  upload.single("image"),
  familyGroupControllers.create
);

familyGroupRoute.post("/generate", familyGroupControllers.generateJoinLink);
familyGroupRoute.post("/join/:gid", familyGroupControllers.join);
familyGroupRoute.put(
  "/host-edit/:uid",
  checkAuthorization,
  familyGroupControllers.hostEdit
);
module.exports = familyGroupRoute;
