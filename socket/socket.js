import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});
const userSocketMap = {}; //store userId and socket id of loggedin user

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
  }

  //return online user from backend to frontend
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //cleanup if user offline or disconnect
  socket.on("disconnect", () => {
    console.log("user disconnect", socket.id);
    delete userSocketMap[userId];
    //update users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server };
