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
// PUT /api/treasures/:id — Reforgin' plunder (ROUGH-SEAS-001)
// ============================================================
describe("PUT /api/treasures/:id", () => {
  test("should update a treasure and return 200 with updated fields", async () => {
    // First, stash a treasure
    const postRes = await request(app)
      .post("/api/treasures")
      .send(sampleTreasure);

    const treasureId = postRes.body.id;

    // Now update it with new details
    const updatedFields = {
      name: "Platinum Crown",
      value: 15000,
      location: "Davy Jones' Locker",
      dateFound: "2024-06-01T00:00:00.000Z",
    };

    const res = await request(app)
      .put(`/api/treasures/${treasureId}`)
      .send(updatedFields)
      .expect(200);

    expect(res.body.id).toBe(treasureId);
    expect(res.body.name).toBe("Platinum Crown");
    expect(res.body.value).toBe(15000);
    expect(res.body.location).toBe("Davy Jones' Locker");
    expect(res.body.dateFound).toBe("2024-06-01T00:00:00.000Z");
  });

  test("should return 400 when required fields are missing in update", async () => {
    // Stash a treasure first
    const postRes = await request(app)
      .post("/api/treasures")
      .send(sampleTreasure);

    const treasureId = postRes.body.id;

    // Try updating with incomplete data — only name, no value/location/dateFound
    const res = await request(app)
      .put(`/api/treasures/${treasureId}`)
      .send({ name: "Half-baked Update" })
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });

  test("should return 404 when updating a non-existent treasure", async () => {
    const res = await request(app)
      .put("/api/treasures/non-existent-id-999")
      .send(sampleTreasure)
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

// ============================================================
// Edge cases — pluggin' every leak in the hull (BARNACLES-004)
// ============================================================
describe("Edge cases — error handling and validation", () => {
  // KRAKEN-001: Non-JSON content type should return 400 JSON, not a stack trace
  test("should return 400 JSON when sending non-JSON content type", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .set("Content-Type", "text/plain")
      .send("This ain't JSON, matey")
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });

  // KRAKEN-001: Malformed JSON should return 400 JSON, not a stack trace
  test("should return 400 JSON when sending malformed JSON", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .set("Content-Type", "application/json")
      .send("{this ain't valid json}")
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });

  // ROUGH-SEAS-002: Whitespace-only strings should be rejected
  test("should return 400 when name is whitespace only", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send({
        ...sampleTreasure,
        name: "   ",
      })
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });

  test("should return 400 when location is whitespace only", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send({
        ...sampleTreasure,
        location: "   ",
      })
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });

  // BARNACLES-001: Invalid date format should be rejected
  test("should return 400 for an invalid dateFound format", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send({
        ...sampleTreasure,
        dateFound: "not-a-real-date",
      })
      .expect(400);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/valid date/i);
  });

  // BARNACLES-003: Overly long strings should be rejected
  test("should return 400 when name exceeds max length", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send({
        ...sampleTreasure,
        name: "A".repeat(501),
      })
      .expect(400);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/500 characters/);
  });

  // Verify trimming works — leading/trailing spaces are stripped from stored values
  test("should trim whitespace from string fields on create", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send({
        name: "  Trimmed Treasure  ",
        value: 100,
        location: "  Trim Island  ",
        dateFound: "  2024-01-01T00:00:00.000Z  ",
      })
      .expect(201);

    expect(res.body.name).toBe("Trimmed Treasure");
    expect(res.body.location).toBe("Trim Island");
    expect(res.body.dateFound).toBe("2024-01-01T00:00:00.000Z");
  });

  // BARNACLES-003 (R2): value: 0 should be rejected (boundary condition)
  test("should return 400 when value is zero", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send({
        ...sampleTreasure,
        value: 0,
      })
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });

  // ROUGH-SEAS-001 (R2): Non-string types for string fields should be rejected
  test("should return 400 when name is not a string", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send({
        ...sampleTreasure,
        name: { sneaky: "object" },
      })
      .expect(400);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/must be strings/);
  });

  test("should return 400 when location is a number", async () => {
    const res = await request(app)
      .post("/api/treasures")
      .send({
        ...sampleTreasure,
        location: 12345,
      })
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });

  // BARNACLES-004 (R2): PUT endpoint edge case — verify trimming works on update
  test("should trim whitespace from string fields on update via PUT", async () => {
    const postRes = await request(app)
      .post("/api/treasures")
      .send(sampleTreasure);

    const treasureId = postRes.body.id;

    const res = await request(app)
      .put(`/api/treasures/${treasureId}`)
      .send({
        name: "  Updated Treasure  ",
        value: 9999,
        location: "  New Location  ",
        dateFound: "  2025-01-01T00:00:00.000Z  ",
      })
      .expect(200);

    expect(res.body.name).toBe("Updated Treasure");
    expect(res.body.location).toBe("New Location");
    expect(res.body.dateFound).toBe("2025-01-01T00:00:00.000Z");
  });
});
