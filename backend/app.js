const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration - allow production frontend URL
const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
const dropRoutes = require("./src/routes/drop.routes");
const reservationRoutes = require("./src/routes/reservation.routes");
const purchaseRoutes = require("./src/routes/purchase.routes");
const { User } = require("./src/models");

app.use("/api/drops", dropRoutes);
app.use("/api/reserve", reservationRoutes);
app.use("/api/purchase", purchaseRoutes);

// Simple user creation for demo (normally this would be handled by auth system)
app.post("/api/users", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.create({ username });
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Inventory system is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
