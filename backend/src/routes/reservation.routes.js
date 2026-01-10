const express = require("express");
const router = express.Router();
const { reserveDrop } = require("../services/reservation.service");
const { getIO } = require("../sockets");

//--------------->  Simulated user (replace with auth later)
router.post("/:dropId", async (req, res) => {
  try {
    const userId = req.body.userId; 
    const dropId = req.params.dropId;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const io = getIO();
    const reservation = await reserveDrop({ userId, dropId }, io);

    res.status(201).json({
      message: "Reservation successful",
      reservation,
      expiresAt: reservation.expires_at,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

module.exports = router;
