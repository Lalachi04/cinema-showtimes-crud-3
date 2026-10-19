const fs = require("fs");
const path = require("path");
// Built-in SQLite module (Node 22.13+). No native compiling needed.
const { DatabaseSync } = require("node:sqlite");

const dbPath = path.resolve(__dirname, process.env.DB_PATH || "./cinema.db");
const db = new DatabaseSync(dbPath);

// Create the table, then seed 10 sample rows if it is empty.
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
const { count } = db.prepare("SELECT COUNT(*) AS count FROM showtimes").get();
if (count === 0) {
  db.exec(fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8"));
  console.log("Seeded showtimes table with sample records.");
}

module.exports = db;
