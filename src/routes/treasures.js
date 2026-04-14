// 🏴‍☠️ Treasure routes — the map to all the gold
const { Router } = require('express');
const crypto = require('crypto');
const { treasures } = require('../data/store');

const router = Router();

// Strip HTML tags from a string — no stowaways allowed (RSE-5)
// Uses a linear O(n) character walk instead of regex to avoid
// incomplete sanitization of nested tags and ReDoS concerns.
function stripTags(str) {
  let result = '';
  let inTag = false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '<') {
      inTag = true;
    } else if (str[i] === '>' && inTag) {
      inTag = false;
    } else if (!inTag) {
      result += str[i];
    }
  }
  return result;
}

// POST /api/treasures — Bury new treasure
router.post('/', (req, res) => {
  const { name, value, location, dateFound } = req.body;

  // Validate every field like a cautious quartermaster (BRN-6: simplified checks)
  if (typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required and must be a string' });
  }
  if (typeof value !== 'number') {
    return res.status(400).json({ error: 'value is required and must be a number' });
  }
  if (typeof location !== 'string') {
    return res.status(400).json({ error: 'location is required and must be a string' });
  }
  if (typeof dateFound !== 'string') {
    return res.status(400).json({ error: 'dateFound is required and must be a string' });
  }

  // RSE-2: Empty strings don't pass muster
  if (name.trim().length === 0) {
    return res.status(400).json({ error: 'name must not be empty' });
  }
  if (location.trim().length === 0) {
    return res.status(400).json({ error: 'location must not be empty' });
  }
  if (dateFound.trim().length === 0) {
    return res.status(400).json({ error: 'dateFound must not be empty' });
  }

  // RSE-4: Reject Infinity, -Infinity, and NaN — only real numbers aboard this ship
  if (!Number.isFinite(value)) {
    return res.status(400).json({ error: 'value must be a finite number' });
  }

  // RSE-3: No negative loot — pirates don't bury debts
  if (value < 0) {
    return res.status(400).json({ error: 'value must not be negative' });
  }

  // RSE-5: Sanitize string inputs — scrub the decks of XSS
  const treasure = {
    id: crypto.randomUUID(),
    name: stripTags(name),
    value,
    location: stripTags(location),
    dateFound: stripTags(dateFound),
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
