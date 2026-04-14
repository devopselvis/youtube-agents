// ⚓ Weigh anchor and set sail!
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🏴‍☠️ Pirate Treasure API sailing on port ${PORT} — arrr!`);
});
