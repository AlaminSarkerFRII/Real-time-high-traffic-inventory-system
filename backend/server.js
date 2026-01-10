require("dotenv").config();

const http = require("http");
const app = require("./app");
const { sequelize } = require("./src/models");
const { initializeSocket } = require("./src/sockets");
const { startExpirationService } = require("./src/services/expiration.service");

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

(async () => {
  try {
    console.log("⏳ Connecting to Neon PostgreSQL...");

    await sequelize.authenticate();
    console.log("✅ Connected to Neon PostgreSQL");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    // Start the expiration service
    startExpirationService(io);

    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Connection error:", error);
    console.log("💡 Make sure your Neon database credentials are correct and the database exists");
    console.log("💡 Current DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
    process.exit(1);
  }
})();
