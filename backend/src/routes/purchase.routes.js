const express = require("express");
const router = express.Router();
const { purchaseReservedItem } = require("../services/purchase.service");
const { getIO } = require("../sockets");

//-------------- Purchase a reserved item
router.post("/:reservationId", async (req, res) => {
  try {
    const userId = req.body.userId; 
    const reservationId = req.params.reservationId;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const io = getIO();
    const result = await purchaseReservedItem({ userId, reservationId }, io);

    res.status(201).json({
      message: "Purchase completed successfully",
      purchase: result.purchase,
      drop: result.drop,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

module.exports = router;
