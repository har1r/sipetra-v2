const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { version } = require("../package.json");

router.get("/", async (req, res) => {
  const healthCheck = {
    version: version || "v2.0.0",
    server: "Online",
    timestamp: new Date(),
    uptime: Math.floor(process.uptime()),
  };

  try {
    const dbState = mongoose.connection.readyState;

    const states = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    };

    healthCheck.database = states[dbState] || "Unknown";
    healthCheck.api = "Healthy";

    if (dbState === 1) {
      await mongoose.connection.db.admin().ping();
    }

    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.database = "Error";
    healthCheck.api = "Unhealthy";
    healthCheck.message = error.message;

    res.status(503).json(healthCheck);
  }
});

module.exports = router;
