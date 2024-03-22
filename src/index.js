const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const route = require("./routes/index");
const connect = require("./config/db/index");
const notificationController = require("./controllers/notification");

dotenv.config();
const app = express();
const server = http.createServer(app); // Create HTTP server using Express
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connect", (socket) => {
  console.log(socket.id);
  console.log("A user connected");

  // Call locationUpdate function and pass the socket instance
  locationUpdate(socket);
});

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

// Uncomment the following code if you want to trigger notifications
// setTimeout(() => {
//   notiAlert();
// }, 3000);

const notiAlert = async () => {
  await notificationController.alert();
};

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
