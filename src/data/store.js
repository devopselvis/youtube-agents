// ⚓ The treasure hold — where we stash the loot in memory
const treasures = [];

/**
 * Clears the treasure chest without breaking references.
 * We mutate the array (length = 0) so any module holding
 * a reference to `treasures` still sees the same array.
 */
function resetTreasures() {
  treasures.length = 0;
}

module.exports = { treasures, resetTreasures };
