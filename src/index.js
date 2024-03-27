const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const route = require("./routes/index");
const connect = require("./config/db/index");
const alert = require("./helpers/notificationTrigger");

dotenv.config();
const app = express();

connect();

app.use(morgan("dev"));
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

route(app);

setTimeout(() => {
  notificationAlert()
}, 3000);
  
const notificationAlert = async () => {
  alert.alert();
};

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
