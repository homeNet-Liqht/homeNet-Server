const { checkAuthentication } = require("../middlewares/checkAuthen");
const authRoute = require("./authRoute");
const familyGroupRoute = require("./familyGroupRoute");
const notificationRoute = require("./notificationRoute");
const taskRoute = require("./taskRoute");
const userRoute = require("./userRoute");

const route = (app) => {
  app.use("/notification", checkAuthentication, notificationRoute);
  app.use("/auth", authRoute);
  app.use("/user", userRoute);
  app.use("/family", checkAuthentication, familyGroupRoute);
  app.use("/task", checkAuthentication, taskRoute);
};

module.exports = route;
