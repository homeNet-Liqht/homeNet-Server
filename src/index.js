const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const route = require("./routes/index");
const connect = require("./config/db/index");

dotenv.config();
const app = express();
connect();


app.use(morgan());
app.use(cors(
  {
    credentials: true,
    origin: "http://52.62.46.94:8000/"
  }
));
app.use(cookieParser());
app.use(helmet());
app.use(express.json());



route(app);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});