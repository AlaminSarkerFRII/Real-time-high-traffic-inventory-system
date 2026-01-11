// Load environment variables from root directory .env file
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

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
    console.log("Connecting to Neon PostgreSQL...");

    await sequelize.authenticate();
    console.log("Connected to Neon PostgreSQL");

    await sequelize.sync({ alter: true });
    console.log("Database synced");

    // Create a default user for demo purposes
    const { User } = require("./src/models");
    try {
      const [defaultUser, created] = await User.findOrCreate({
        where: { username: "demo_user" },
        defaults: { username: "demo_user" },
      });
      if (created) {
        console.log("Default user created with ID:", defaultUser.id);
      } else {
        console.log(" Default user already exists with ID:", defaultUser.id);
      }
    } catch (error) {
      console.log("Could not create default user:", error.message);
    }

    // Start the expiration service
    startExpirationService(io);

    server.listen(PORT, () => console.log(`Backend Server running on port ${PORT}`));
  } catch (error) {
    console.error("Backend Server Connection error:", error);
    console.log(
      " Make sure your Neon database credentials are correct and the database exists"
    );
    console.log(
      " Current DATABASE_URL:",
      process.env.DATABASE_URL ? "Set" : "Not set"
    );
    process.exit(1);
  }
})();
