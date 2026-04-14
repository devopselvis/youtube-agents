// ⚓ app.js — The main deck of our pirate vessel!
// Here be the Express app setup, middleware, and all the treasure routes.

const express = require("express");
const crypto = require("crypto");
const {
  getAllTreasures,
  getTreasureById,
  addTreasure,
  deleteTreasure,
} = require("./treasureStore");

// Ahoy! Hoist the Express app — our ship be ready to sail
const app = express();

// Parse incoming JSON — every message in a bottle needs readin'
app.use(express.json());

// ============================================================
// Here be the treasure — the core API routes
// All routes under /api/treasures
// ============================================================

/**
 * POST /api/treasures — Log new plunder into the hold
 * Validates all required fields before stowin' the loot
 */
app.post("/api/treasures", (req, res) => {
  const { name, value, location, dateFound } = req.body;

  // Batten down the hatches — validation below
  if (!name || value === undefined || value === null || !location || !dateFound) {
    return res.status(400).json({
      error: "All fields be required: name, value, location, dateFound",
    });
  }

  if (typeof value !== "number" || value <= 0) {
    return res.status(400).json({
      error: "Value must be a positive number, ye scallywag!",
    });
  }

  // All checks passed — create the treasure and stow it
  const treasure = {
    id: crypto.randomUUID(),
    name,
    value,
    location,
    dateFound,
  };

  addTreasure(treasure);

  // Return the newly created treasure with 201 status
  return res.status(201).json(treasure);
});

/**
 * GET /api/treasures — See all the loot in the hold
 */
app.get("/api/treasures", (req, res) => {
  return res.status(200).json(getAllTreasures());
});

/**
 * GET /api/treasures/:id — Find a specific treasure by its id
 */
app.get("/api/treasures/:id", (req, res) => {
  const treasure = getTreasureById(req.params.id);

  if (!treasure) {
    return res.status(404).json({ error: "Treasure not found" });
  }

  return res.status(200).json(treasure);
});

/**
 * DELETE /api/treasures/:id — Cast a treasure overboard
 */
app.delete("/api/treasures/:id", (req, res) => {
  const deleted = deleteTreasure(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: "Treasure not found" });
  }

  // Avast! 204 means no body — the treasure is gone to Davy Jones
  return res.status(204).send();
});

// Export the app for testin' — the Lookout'll need this
module.exports = app;
