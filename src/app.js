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

// Export without calling listen — that's the server's job
module.exports = app;
