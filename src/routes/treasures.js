// 🏴‍☠️ Treasure routes — the map to all the gold
const { Router } = require('express');
const crypto = require('crypto');
const { treasures } = require('../data/store');

const router = Router();

// POST /api/treasures — Bury new treasure
router.post('/', (req, res) => {
  const { name, value, location, dateFound } = req.body;

  // Validate every field like a cautious quartermaster
  if (name === undefined || name === null || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required and must be a string' });
  }
  if (value === undefined || value === null || typeof value !== 'number') {
    return res.status(400).json({ error: 'value is required and must be a number' });
  }
  if (location === undefined || location === null || typeof location !== 'string') {
    return res.status(400).json({ error: 'location is required and must be a string' });
  }
  if (dateFound === undefined || dateFound === null || typeof dateFound !== 'string') {
    return res.status(400).json({ error: 'dateFound is required and must be a string' });
  }

  const treasure = {
    id: crypto.randomUUID(),
    name,
    value,
    location,
    dateFound,
  };

  treasures.push(treasure);
  return res.status(201).json(treasure);
});

// GET /api/treasures — Show all the plunder
router.get('/', (_req, res) => {
  return res.status(200).json(treasures);
});

// GET /api/treasures/:id — Find a specific haul
router.get('/:id', (req, res) => {
  const treasure = treasures.find((t) => t.id === req.params.id);
  if (!treasure) {
    return res.status(404).json({ error: 'Treasure not found' });
  }
  return res.status(200).json(treasure);
});

// DELETE /api/treasures/:id — Toss treasure overboard
router.delete('/:id', (req, res) => {
  const index = treasures.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Treasure not found' });
  }
  treasures.splice(index, 1);
  return res.sendStatus(204);
});

module.exports = router;
