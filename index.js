const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

// 1. Define who is legally allowed to talk to this server
const allowedOrigins = [
  process.env.FRONTEND_URL, // In case you set it in Railway environment variables
  "https://vaaratav-web.vercel.app", // <--- VERIFY THIS IS YOUR EXACT VERCEL URL
  "http://localhost:3000" // Keep localhost so you can still test on your computer
];

// 2. Secure standard HTTP requests
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);

// 3. Secure Socket.io connections
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true // Crucial for cross-origin connections
  },
});

// --- YOUR EXACT SOCKET LOGIC (Unchanged) ---
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId, userName);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });

  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.roomId).emit("ice-candidate", data);
  });

  socket.on("send-message", (roomId, messageData) => {
    socket.to(roomId).emit("receive-message", messageData);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io signaling server running on port ${PORT}`);
});