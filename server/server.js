// import express from 'express';
// import 'dotenv/config';
// import cors from 'cors';
// import http from 'http';
// import { connectDB } from './lib/db.js';
// import userRouter from './routes/userRoutes.js';
// import messageRouter from './routes/messageRoutes.js';
// import {Server} from 'socket.io';

// // creating the express using the http server 
// const app = express();
// const server = http.createServer(app)

// // initialize socket.io server 
// export const io = new  Server(server,{
//     cors :{origin : "*"}
// }) 


// // store online user 
// export const userSocketMap ={};//{userid : socketid}

// //socket.io connection handler
// io.on("connection",(socket)=>{
//     const userId = socket.handshake.query.userId;
//     console.log("user connected ! ",userId);

//     if(userId) userSocketMap[userId] = socket.id;

//     // emit online user to all connected 
//     io.emit("getOnlineUsers",Object.keys(userSocketMap));

//     socket.on("disconnect ",()=>{
//         console.log("User Disconnected",userId);
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers",Object.keys(userSocketMap))
//     })
// })

// // middleware setup 
// app.use(express.json({ limit: "4mb" }));
// app.use(cors());

// // route setup 
// app.use("/api/status", (req, res) => res.send("server is live "));
// app.use("/api/auth",userRouter);
// app.use("/api/messages",messageRouter)



// // connect the mongodb
// await connectDB();

// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => console.log("Server is running on PORT : " + PORT));











import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();

// Create express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store online users { userId: socketId }
export const userSocketMap = {};

// Socket.IO connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Emit updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ----------------------------
// Middleware
// ----------------------------

// ✅ Parse JSON bodies with large size limit for base64 images
app.use(express.json({ limit: "50mb" })); 

// Enable CORS
app.use(cors());

// ----------------------------
// Routes
// ----------------------------
app.use("/api/status", (req, res) => res.send("Server is live ✅"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ----------------------------
// Connect to MongoDB
// ----------------------------
await connectDB();

// ----------------------------
// Start the server
// ----------------------------
if(process.env.NODE_ENV !== "production"){

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`🚀 Server running on PORT: ${PORT}`));
}

// its for the versal 
export default server;