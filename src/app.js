// ⚓ app.js — The main deck of our pirate vessel!
// Here be the Express app setup, middleware, and all the treasure routes.

const express = require("express");
const crypto = require("crypto");
const {
  getAllTreasures,
  getTreasureById,
  addTreasure,
  updateTreasure,
  deleteTreasure,
} = require("./treasureStore");

// Ahoy! Hoist the Express app — our ship be ready to sail
const app = express();

// Parse incoming JSON — every message in a bottle needs readin'
app.use(express.json());

// ============================================================
// Validation helpers — keep the rigging tight, matey!
// ============================================================

// Max length for string fields — no novel-length treasure names, ye hear? (BARNACLES-003)
const MAX_STRING_LENGTH = 500;

/**
 * validateTreasureFields — Shared validation for POST and PUT
 * Checks required string fields, value, dateFound format, and length limits.
 * @param {Object} body - The request body to validate
 * @returns {string|null} An error message if validation fails, or null if all's well
 */
function validateTreasureFields(body) {
  const { name, value, location, dateFound } = body;

  // Batten down the hatches — all fields be required
  if (
    !name || !String(name).trim() ||
    value === undefined || value === null ||
    !location || !String(location).trim() ||
    !dateFound || !String(dateFound).trim()
  ) {
    return "All fields be required: name, value, location, dateFound";
  }

  // Value must be a number worth plunderin'
  if (typeof value !== "number" || value <= 0) {
    return "Value must be a positive number, ye scallywag!";
  }

  // BARNACLES-001: Validate dateFound is a real date, not gibberish
  // Trim first so leading/trailing whitespace doesn't trip up the Date parser
  const trimmedDate = String(dateFound).trim();
  const parsedDate = new Date(trimmedDate);
  if (isNaN(parsedDate.getTime())) {
    return "dateFound must be a valid date string, ye landlubber!";
  }

  // BARNACLES-003: No field shall exceed MAX_STRING_LENGTH characters
  if (String(name).length > MAX_STRING_LENGTH) {
    return `name must not exceed ${MAX_STRING_LENGTH} characters`;
  }
  if (String(location).length > MAX_STRING_LENGTH) {
    return `location must not exceed ${MAX_STRING_LENGTH} characters`;
  }
  if (String(dateFound).length > MAX_STRING_LENGTH) {
    return `dateFound must not exceed ${MAX_STRING_LENGTH} characters`;
  }

  return null;
}

// ============================================================
// Here be the treasure — the core API routes
// All routes under /api/treasures
// ============================================================

/**
 * POST /api/treasures — Log new plunder into the hold
 * Validates all required fields before stowin' the loot
 */
app.post("/api/treasures", (req, res) => {
  // KRAKEN-001 fix: Guard against missing body (e.g. non-JSON content types)
  if (!req.body) {
    return res.status(400).json({
      error: "Request body be missing — send JSON, ye scallywag!",
    });
  }

  const { name, value, location, dateFound } = req.body;

  // Run shared validation
  const validationError = validateTreasureFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // All checks passed — create the treasure and stow it (trim string fields — ROUGH-SEAS-002)
  const treasure = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    value,
    location: String(location).trim(),
    dateFound: String(dateFound).trim(),
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
 * PUT /api/treasures/:id — Reforge a piece of plunder (ROUGH-SEAS-001)
 * Updates an existing treasure with new field values.
 */
app.put("/api/treasures/:id", (req, res) => {
  // Guard against missing body
  if (!req.body) {
    return res.status(400).json({
      error: "Request body be missing — send JSON, ye scallywag!",
    });
  }

  // Run shared validation on the incoming fields
  const validationError = validateTreasureFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, value, location, dateFound } = req.body;

  // Trim string fields before stowin' (ROUGH-SEAS-002)
  const updates = {
    name: String(name).trim(),
    value,
    location: String(location).trim(),
    dateFound: String(dateFound).trim(),
  };

  const updated = updateTreasure(req.params.id, updates);

  if (!updated) {
    return res.status(404).json({ error: "Treasure not found" });
  }

  return res.status(200).json(updated);
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

// ============================================================
// KRAKEN-001 fix: Error-handling middleware — plug all leaks!
// This MUST be after all routes so Express can catch stray errors.
// Signature (err, req, res, next) tells Express this be an error handler.
// ============================================================
app.use((err, req, res, next) => {
  // Malformed JSON from express.json() throws a SyntaxError — return 400
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Malformed JSON in request body — check yer message in a bottle!",
    });
  }

  // All other errors — return a generic 500 without leakin' the stack trace
  return res.status(500).json({
    error: "Something went wrong aboard the ship!",
  });
});

// Export the app for testin' — the Lookout'll need this
module.exports = app;
