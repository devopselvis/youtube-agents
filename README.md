# 🏴‍☠️ Pirate Treasure Tracker API

A RESTful API for trackin' pirate treasure! Built with Node.js and Express, this API lets ye log, view, and manage yer plunder with full CRUD operations.

## ⚓ Installation

```bash
npm install
```

## 🚀 Running the Server

```bash
npm start
```

The API will be listenin' on port **3000** (or whatever `PORT` environment variable ye set).

## 🧪 Running Tests

```bash
npm test
```

## 📡 API Endpoints

All endpoints be under `/api/treasures`.

### Create a Treasure

```
POST /api/treasures
```

**Request Body:**
```json
{
  "name": "Golden Doubloon Chest",
  "value": 5000,
  "location": "Tortuga Bay",
  "dateFound": "2024-03-15T00:00:00.000Z"
}
```

**Response:** `201 Created` with the treasure object (includes generated `id`).

### Get All Treasures

```
GET /api/treasures
```

**Response:** `200 OK` with an array of all treasures.

### Get a Treasure by ID

```
GET /api/treasures/:id
```

**Response:** `200 OK` with the treasure object, or `404 Not Found`.

### Update a Treasure

```
PUT /api/treasures/:id
```

**Request Body:**
```json
{
  "name": "Platinum Crown",
  "value": 15000,
  "location": "Davy Jones' Locker",
  "dateFound": "2024-06-01T00:00:00.000Z"
}
```

**Response:** `200 OK` with the updated treasure object, `400 Bad Request` if validation fails, or `404 Not Found`.

### Delete a Treasure

```
DELETE /api/treasures/:id
```

**Response:** `204 No Content` on success, or `404 Not Found`.

## 📦 Data Model

| Field       | Type   | Description                        |
|-------------|--------|------------------------------------|
| `id`        | String | UUID v4, auto-generated            |
| `name`      | String | Name of the treasure (required)    |
| `value`     | Number | Value in doubloons (required, > 0) |
| `location`  | String | Where the treasure was found       |
| `dateFound` | String | ISO 8601 date string               |
