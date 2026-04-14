// ⚓ treasureStore.js — The hold where we keep our plunder!
// This be the in-memory treasure vault. Every doubloon tracked here, matey.

// Ahoy! This array be our treasure chest — all loot goes in here
let treasures = [];

/**
 * getAllTreasures — Lay eyes on the entire hoard
 * Returns a shallow copy so no scallywag can tamper with the hold directly (BARNACLES-002)
 * @returns {Array} A copy of all the treasures in our hold
 */
function getAllTreasures() {
  return [...treasures];
}

/**
 * getTreasureById — Find a specific piece of plunder by its id
 * @param {string} id - The UUID of the treasure we seek
 * @returns {Object|undefined} The treasure if found, undefined if lost to the deep
 */
function getTreasureById(id) {
  return treasures.find((t) => t.id === id);
}

/**
 * addTreasure — Stash new loot in the hold
 * @param {Object} treasure - The treasure object to store
 * @returns {Object} The treasure that was added
 */
function addTreasure(treasure) {
  treasures.push(treasure);
  return treasure;
}

/**
 * deleteTreasure — Toss a piece overboard (remove by id)
 * @param {string} id - The UUID of the treasure to remove
 * @returns {boolean} true if the treasure was found and deleted, false otherwise
 */
function deleteTreasure(id) {
  // Batten down the hatches — check if this treasure even exists
  const index = treasures.findIndex((t) => t.id === id);
  if (index === -1) {
    return false;
  }
  treasures.splice(index, 1);
  return true;
}

/**
 * updateTreasure — Reforge a piece of plunder with new details (ROUGH-SEAS-001)
 * @param {string} id - The UUID of the treasure to update
 * @param {Object} updates - The fields to update (name, value, location, dateFound)
 * @returns {Object|null} The updated treasure, or null if it be lost to the deep
 */
function updateTreasure(id, updates) {
  const treasure = treasures.find((t) => t.id === id);
  if (!treasure) {
    return null;
  }

  // Only update fields that were provided — don't sink the whole ship
  if (updates.name !== undefined) treasure.name = updates.name;
  if (updates.value !== undefined) treasure.value = updates.value;
  if (updates.location !== undefined) treasure.location = updates.location;
  if (updates.dateFound !== undefined) treasure.dateFound = updates.dateFound;

  return treasure;
}

/**
 * clearTreasures — Empty the hold (used for testin' battle drills)
 * The Lookout'll be usin' this to reset between tests
 */
function clearTreasures() {
  treasures = [];
}

module.exports = {
  getAllTreasures,
  getTreasureById,
  addTreasure,
  updateTreasure,
  deleteTreasure,
  clearTreasures,
};
