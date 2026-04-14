// ⚓ server.js — Set sail! This be the entry point to our vessel.
// Avast! Don't touch this without the Captain's say-so.

const app = require("./app");

// The port we be listenin' on — check the environment or default to 3000
const PORT = process.env.PORT || 3000;

// Hoist the anchor and set sail!
app.listen(PORT, () => {
  console.log(`Pirate Treasure API be listenin' on port ${PORT}`);
});
