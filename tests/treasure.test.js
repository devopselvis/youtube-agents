// ⚓ treasure.test.js — Battle drills for the Pirate Treasure API!
// The Lookout'll be watchin' these closely, so keep 'em tight, matey.

const request = require("supertest");
const app = require("../src/app");
const { clearTreasures } = require("../src/treasureStore");

// Sample treasure for our tests — a fine piece of plunder
const sampleTreasure = {
  name: "Golden Doubloon Chest",
  value: 5000,
  location: "Tortuga Bay",
  dateFound: "2024-03-15T00:00:00.000Z",
};

// Clear the hold before each battle drill so we start fresh
beforeEach(() => {
  clearTreasures();
});

// ============================================================
// POST /api/treasures — Loggin' new plunder
// ============================================================
describe("POST /api/treasures", () => {
  test("should create a new treasure and return 201 with all fields including id", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send(sampleTreasure)
      .expect(201);

    // The returned treasure should have all the fields we sent plus an id
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(sampleTreasure.name);
    expect(res.body.value).toBe(sampleTreasure.value);
    expect(res.body.location).toBe(sampleTreasure.location);
    expect(res.body.dateFound).toBe(sampleTreasure.dateFound);
  });

  test("should return 400 when required fields are missing", async () => {
    // Send an empty body — no treasure info at all, ye scallywag!
    const res = await request(app)
      .post("/api/treasures")
      .send({ name: "Incomplete Loot" })
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });

  test("should return 400 when value is negative", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send({
        ...sampleTreasure,
        value: -100,
      })
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });
});

// ============================================================
// GET /api/treasures — Viewin' the whole hoard
// ============================================================
describe("GET /api/treasures", () => {
  test("should return an empty array when no treasures exist", async () => {
    const res = await request(app).get("/api/treasures").expect(200);

    expect(res.body).toEqual([]);
  });

  test("should return all treasures after adding some", async () => {
    // Stash two treasures in the hold
    await request(app).post("/api/treasures").send(sampleTreasure);
    await request(app).post("/api/treasures").send({
      name: "Silver Chalice",
      value: 2000,
      location: "Skull Island",
      dateFound: "2024-04-01T00:00:00.000Z",
    });

    const res = await request(app).get("/api/treasures").expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe("Golden Doubloon Chest");
    expect(res.body[1].name).toBe("Silver Chalice");
  });
});

// ============================================================
// GET /api/treasures/:id — Findin' a specific piece of plunder
// ============================================================
describe("GET /api/treasures/:id", () => {
  test("should return the correct treasure by ID", async () => {
    // First, stash a treasure
    const postRes = await request(app)
      .post("/api/treasures")
      .send(sampleTreasure);

    const treasureId = postRes.body.id;

    // Now fetch it by ID
    const res = await request(app)
      .get(`/api/treasures/${treasureId}`)
      .expect(200);

    expect(res.body.id).toBe(treasureId);
    expect(res.body.name).toBe(sampleTreasure.name);
  });

  test("should return 404 for a non-existent ID", async () => {
    const res = await request(app)
      .get("/api/treasures/non-existent-id-999")
      .expect(404);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Treasure not found");
  });
});

// ============================================================
// DELETE /api/treasures/:id — Castin' loot overboard
// ============================================================
describe("DELETE /api/treasures/:id", () => {
  test("should delete a treasure and return 204", async () => {
    // First, stash a treasure
    const postRes = await request(app)
      .post("/api/treasures")
      .send(sampleTreasure);

    const treasureId = postRes.body.id;

    // Now delete it — walk the plank!
    await request(app).delete(`/api/treasures/${treasureId}`).expect(204);

    // Verify it be gone — should get 404 now
    await request(app).get(`/api/treasures/${treasureId}`).expect(404);
  });

  test("should return 404 when deleting a non-existent treasure", async () => {
    const res = await request(app)
      .delete("/api/treasures/non-existent-id-999")
      .expect(404);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Treasure not found");
  });
});
