const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow all cross-origin requests

const server = http.createServer(app);

// Configure Socket.io to accept connections from your future Vercel domain
const io = new Server(server, {
  cors: {
    origin: "*", // We will lock this down to your Vercel URL later for security
    methods: ["GET", "POST"],
  },
});

// --- YOUR EXACT SOCKET LOGIC ---
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