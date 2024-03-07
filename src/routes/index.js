const { checkAuthentication } = require("../middlewares/checkAuthen");
const authRoute = require("./authRoute");
const familyGroupRoute = require("./familyGroupRoute");
const taskRoute = require("./taskRoute");
const userRoute = require("./userRoute");

const route = (app) => {
  app.use("/auth", authRoute);
  app.use("/user", userRoute);
  app.use("/family", checkAuthentication, familyGroupRoute);
  app.use("/task", checkAuthentication, taskRoute);
};

module.exports = route;
