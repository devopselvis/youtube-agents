// 🚢 The ship herself — Express app assembly
const express = require('express');
const treasureRoutes = require('./routes/treasures');

const app = express();

// Parse JSON payloads from incoming requests
app.use(express.json());

// Mount the treasure routes at /api/treasures
app.use('/api/treasures', treasureRoutes);

// Health check — make sure the ship's still afloat
app.get('/', (_req, res) => {
  return res.status(200).json({ message: 'Pirate Treasure API' });
});

// RSE-1: Error-handling middleware — don't leak the ship's blueprints
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  return res.status(500).json({ error: 'Internal server error' });
});

// Export without calling listen — that's the server's job
module.exports = app;
