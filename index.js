// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import connectDB from "./config/databae.js";
// import userRoute from "./routes/userRoute.js";
// import messageRoute from "./routes/messageRoute.js";
// import cors from "cors";

// dotenv.config({});
// const app = express();

// // middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// const corsOptions = {
//   origin: "http://localhost:3000",
//   credentials: true,
// };

// app.use(cors(corsOptions));

// // api's
// app.use("/api/v1/user", userRoute);
// app.use("/api/v1/message", messageRoute);

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   connectDB();
//   console.log(`Server listen at prot ${PORT}`);
// });

// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import { Server } from "socket.io";
// import http from "http";
// import connectDB from "./config/databae.js";
// import userRoute from "./routes/userRoute.js";
// import messageRoute from "./routes/messageRoute.js";

// dotenv.config({});

// const app = express();
// const server = http.createServer(app);
// export const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

// const corsOptions = {
//   origin: "http://localhost:3000",
//   credentials: true,
// };

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(cors(corsOptions));

// // API routes
// app.use("/api/v1/user", userRoute);
// app.use("/api/v1/message", messageRoute);


// const userSocketMap = {}; // Store userId and socket id of logged-in users

// export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// io.on("connection", (socket) => {
//   console.log("User connected", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (userId !== undefined) {
//     userSocketMap[userId] = socket.id;
//   }

//   // Return online users to the frontend
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   // Cleanup when user disconnects
//   socket.on("disconnect", () => {
//     console.log("User disconnected", socket.id);
//     delete userSocketMap[userId];
//     // Update online users
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// // Start the server
// const PORT = process.env.PORT || 8000;
// server.listen(PORT, () => {
//   connectDB(); // Connect to the database
//   console.log(`Server listening on port ${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import connectDB from "./config/databae.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";

dotenv.config({});

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

const userSocketMap = {}; // Store userId and socket id of logged-in users

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
  }

  // Return online users to the frontend
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Cleanup when user disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    delete userSocketMap[userId];
    // Update online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Handle incoming message
  socket.on("sendMessage", (message) => {
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      // Emit the message to the receiver
      io.to(receiverSocketId).emit("newMessage", message);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  connectDB(); // Connect to the database
  console.log(`Server listening on port ${PORT}`);
});
