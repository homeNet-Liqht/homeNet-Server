const { Server } = require("socket.io");
const { createServer } = require("http");
const locationUpdate = require("./uploadLocation");

const server = createServer();
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

module.exports = { io, server };