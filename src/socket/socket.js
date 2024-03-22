const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const locationUpdate = require("./uploadLocation");


const app = express();
const server = http.createServer(app);
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