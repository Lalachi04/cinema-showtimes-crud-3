-- Part A: single table for the Cinema Showtimes theme
CREATE TABLE IF NOT EXISTS showtimes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_title      TEXT    NOT NULL,
  genre            TEXT,
  hall             TEXT,
  show_date        TEXT,              -- YYYY-MM-DD
  show_time        TEXT,              -- HH:MM (24h)
  ticket_price     REAL    DEFAULT 0, -- Zambian Kwacha (ZMW)
  available_seats  INTEGER DEFAULT 0,
  created_at       TEXT    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TEXT    DEFAULT CURRENT_TIMESTAMP
);
