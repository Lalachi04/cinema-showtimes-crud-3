require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Serve the frontend from the same server (so one deployment hosts everything)
app.use(express.static(path.join(__dirname, "..", "frontend")));

const FIELDS = ["movie_title", "genre", "hall", "show_date", "show_time", "ticket_price", "available_seats"];

// Validate and clean a request body. Returns { data, error }.
function clean(body, existing = {}) {
  const merged = { ...existing };
  for (const f of FIELDS) if (body[f] !== undefined) merged[f] = body[f];

  const title = String(merged.movie_title ?? "").trim();
  if (!title) return { error: "movie_title is required" };

  const price = Number(merged.ticket_price ?? 0);
  if (!Number.isFinite(price) || price < 0) return { error: "ticket_price must be a number >= 0" };

  const seats = Number(merged.available_seats ?? 0);
  if (!Number.isInteger(seats) || seats < 0) return { error: "available_seats must be a whole number >= 0" };

  return {
    data: {
      movie_title: title,
      genre: merged.genre ? String(merged.genre).trim() : null,
      hall: merged.hall ? String(merged.hall).trim() : null,
      show_date: merged.show_date ? String(merged.show_date).trim() : null,
      show_time: merged.show_time ? String(merged.show_time).trim() : null,
      ticket_price: price,
      available_seats: seats,
    },
  };
}

const getOne = (id) => db.prepare("SELECT * FROM showtimes WHERE id = ?").get(id);

// GET /api/showtimes -> list all
app.get("/api/showtimes", (req, res) => {
  const rows = db.prepare("SELECT * FROM showtimes ORDER BY show_date, show_time, id").all();
  res.json(rows);
});

// GET /api/showtimes/:id -> one record
app.get("/api/showtimes/:id", (req, res) => {
  const row = getOne(req.params.id);
  if (!row) return res.status(404).json({ error: "Showtime not found" });
  res.json(row);
});

// POST /api/showtimes -> create
app.post("/api/showtimes", (req, res) => {
  const { data, error } = clean(req.body || {});
  if (error) return res.status(400).json({ error });
  const info = db
    .prepare(
      `INSERT INTO showtimes (movie_title, genre, hall, show_date, show_time, ticket_price, available_seats)
       VALUES (@movie_title, @genre, @hall, @show_date, @show_time, @ticket_price, @available_seats)`
    )
    .run(data);
  res.status(201).json(getOne(info.lastInsertRowid));
});

// PUT /api/showtimes/:id -> update
app.put("/api/showtimes/:id", (req, res) => {
  const existing = getOne(req.params.id);
  if (!existing) return res.status(404).json({ error: "Showtime not found" });
  const { data, error } = clean(req.body || {}, existing);
  if (error) return res.status(400).json({ error });
  db.prepare(
    `UPDATE showtimes SET movie_title=@movie_title, genre=@genre, hall=@hall, show_date=@show_date,
     show_time=@show_time, ticket_price=@ticket_price, available_seats=@available_seats,
     updated_at=CURRENT_TIMESTAMP WHERE id=@id`
  ).run({ ...data, id: existing.id });
  res.json(getOne(existing.id));
});

// DELETE /api/showtimes/:id -> delete
app.delete("/api/showtimes/:id", (req, res) => {
  const existing = getOne(req.params.id);
  if (!existing) return res.status(404).json({ error: "Showtime not found" });
  db.prepare("DELETE FROM showtimes WHERE id = ?").run(existing.id);
  res.json({ message: "Showtime deleted", deleted: existing });
});

// JSON 404 for unknown API routes and JSON error handler
app.use("/api", (req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.type === "entity.parse.failed" ? 400 : 500;
  res.status(status).json({ error: status === 400 ? "Invalid JSON body" : "Server error" });
});

app.listen(PORT, () => console.log(`Cinema Showtimes API running on port ${PORT}`));
