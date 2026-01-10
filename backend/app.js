const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Inventory system is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
