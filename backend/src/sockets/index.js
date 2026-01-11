const { Server } = require("socket.io");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send initial stock data to new clients
    socket.emit("connected", { message: "Connected to inventory system" });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Optional: Allow clients to request current stock
    socket.on("getStock", async (dropId) => {
      // This could be implemented to send current stock for a specific drop
      // For now, clients should get stock updates via the dashboard API
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};
