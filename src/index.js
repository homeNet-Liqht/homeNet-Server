const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const route = require("./routes/index");
const connect = require("./config/db/index");

dotenv.config();
const app = express();
connect();

app.use(morgan("dev")); // specifying the morgan logging format
app.use(
  cors({
    credentials: true,
    origin: "*", // allow requests from all origins, you might want to change this in a production environment
  })
);
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
