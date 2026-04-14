// 🧪 Sea trials for the Pirate Treasure API
const request = require('supertest');
const app = require('../src/app');
const { resetTreasures } = require('../src/data/store');

// Wipe the hold clean before each trial
beforeEach(() => {
  resetTreasures();
});

// -- Test data used throughout the trials --
const treasure1 = {
  name: "Blackbeard's Gold",
  value: 10000,
  location: 'Caribbean Sea',
  dateFound: '1718-11-22',
};

const treasure2 = {
  name: 'Silver Chalice',
  value: 2500,
  location: 'Port Royal',
  dateFound: '1692-06-07',
};

// ─── Health Check ───────────────────────────────────
describe('GET /', () => {
  it('returns 200 with the API message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Pirate Treasure API' });
  });
});

// ─── Create Treasures ───────────────────────────────
describe('POST /api/treasures', () => {
  it('creates a treasure and returns 201', async () => {
    const res = await request(app)
      .post('/api/treasures')
      .send(treasure1);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(treasure1);
    expect(res.body.id).toBeDefined();
  });

  it('rejects a request missing name with 400', async () => {
    const { name, ...body } = treasure1;
    const res = await request(app).post('/api/treasures').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects a request missing value with 400', async () => {
    const { value, ...body } = treasure1;
    const res = await request(app).post('/api/treasures').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects a request missing location with 400', async () => {
    const { location, ...body } = treasure1;
    const res = await request(app).post('/api/treasures').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects a request missing dateFound with 400', async () => {
    const { dateFound, ...body } = treasure1;
    const res = await request(app).post('/api/treasures').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects value when it is a string with 400', async () => {
    const res = await request(app)
      .post('/api/treasures')
      .send({ ...treasure1, value: 'not-a-number' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects an empty body with 400', async () => {
    const res = await request(app).post('/api/treasures').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ─── Rough Seas Fixes — Additional Validation ───────
describe('POST /api/treasures — Rough Seas fixes', () => {
  it('RSE-1: returns 400 JSON on malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/treasures')
      .set('Content-Type', 'application/json')
      .send('{ this is not valid json }');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    // Must NOT contain a stack trace or HTML
    expect(res.text).not.toMatch(/<html/i);
  });

  it('RSE-2: rejects empty string name with 400', async () => {
    const res = await request(app)
      .post('/api/treasures')
      .send({ name: '', value: 100, location: 'Island', dateFound: '2024-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('RSE-3: rejects negative value with 400', async () => {
    const res = await request(app)
      .post('/api/treasures')
      .send({ name: 'Debt Note', value: -500, location: 'Davy Jones', dateFound: '2024-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('RSE-4: rejects Infinity value with 400', async () => {
    const res = await request(app)
      .post('/api/treasures')
      .set('Content-Type', 'application/json')
      .send('{"name":"Big Haul","value":1e999,"location":"Nowhere","dateFound":"2024-01-01"}');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('RSE-5: strips HTML tags from name in stored treasure', async () => {
    const res = await request(app)
      .post('/api/treasures')
      .send({
        name: '<script>alert("xss")</script>Gold Coin',
        value: 50,
        location: '<b>Secret</b> Island',
        dateFound: '2024-01-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('alert("xss")Gold Coin');
    expect(res.body.location).toBe('Secret Island');
    // Verify tags are gone — no angle brackets remain
    expect(res.body.name).not.toMatch(/<[^>]*>/);
    expect(res.body.location).not.toMatch(/<[^>]*>/);
  });
});

// ─── List Treasures ─────────────────────────────────
describe('GET /api/treasures', () => {
  it('returns an empty array when no treasures exist', async () => {
    const res = await request(app).get('/api/treasures');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all treasures after adding some', async () => {
    await request(app).post('/api/treasures').send(treasure1);
    await request(app).post('/api/treasures').send(treasure2);

    const res = await request(app).get('/api/treasures');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

// ─── Get Single Treasure ────────────────────────────
describe('GET /api/treasures/:id', () => {
  it('returns a specific treasure by ID', async () => {
    const created = await request(app)
      .post('/api/treasures')
      .send(treasure1);

    const res = await request(app).get(`/api/treasures/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(treasure1);
  });

  it('returns 404 for a nonexistent treasure', async () => {
    const res = await request(app).get('/api/treasures/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Treasure not found' });
  });
});

// ─── Delete Treasure ────────────────────────────────
describe('DELETE /api/treasures/:id', () => {
  it('deletes a treasure and returns 204', async () => {
    const created = await request(app)
      .post('/api/treasures')
      .send(treasure1);

    const res = await request(app).delete(`/api/treasures/${created.body.id}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it('confirms treasure is gone after deletion', async () => {
    const created = await request(app)
      .post('/api/treasures')
      .send(treasure1);

    await request(app).delete(`/api/treasures/${created.body.id}`);

    const res = await request(app).get(`/api/treasures/${created.body.id}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Treasure not found' });
  });

  it('returns 404 when deleting a nonexistent treasure', async () => {
    const res = await request(app).delete('/api/treasures/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Treasure not found' });
  });
});
