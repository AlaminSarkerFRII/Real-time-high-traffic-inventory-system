const express = require("express");
const router = express.Router();
const { createDrop, getActiveDrops, getDropById } = require("../services/drop.service");

// -------------> Get all active drops with activity feed --------->
router.get("/", async (req, res) => {
  try {
    const drops = await getActiveDrops();
    res.json(drops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------> Get specific drop by ID ------------>
router.get("/:id", async (req, res) => {
  try {
    const drop = await getDropById(req.params.id);
    res.json(drop);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ---------------> Create new drop (admin endpoint) -------------->
router.post("/", async (req, res) => {
  try {
    const { name, price, totalStock, dropStartTime } = req.body;

    if (!name || !price || !totalStock) {
      return res.status(400).json({
        error: "Missing required fields: name, price, totalStock",
      });
    }

    const drop = await createDrop({
      name,
      price: parseFloat(price),
      totalStock: parseInt(totalStock),
      dropStartTime: dropStartTime ? new Date(dropStartTime) : undefined,
    });

    res.status(201).json({
      message: "Drop created successfully",
      drop,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
