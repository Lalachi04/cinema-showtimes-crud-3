# Cinema Showtimes - Single-Table CRUD App (ICT251 Activity 4)

Question 15: resource `showtimes`, table `showtimes`.
Stack: Node.js + Express, SQLite (built-in node:sqlite, Node 22.13+), HTML + vanilla JavaScript.

## Structure
```
cinema-showtimes-crud/
├─ backend/    .env  package.json  schema.sql  seed.sql  db.js  server.js
├─ frontend/   index.html  styles.css  app.js
└─ postman/    Cinema_Showtimes_API.postman_collection.json
```

## Run locally (PowerShell)
```
cd backend
npm install
npm start
```
Open http://localhost:3000 (the Express server also serves the frontend).
The database file (`cinema.db`) and the 10 sample rows are created automatically on first start.

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/showtimes | List all records |
| GET | /api/showtimes/:id | Get one record |
| POST | /api/showtimes | Create (body: movie_title required) |
| PUT | /api/showtimes/:id | Update (send any fields to change) |
| DELETE | /api/showtimes/:id | Delete |

Sample POST body:
```json
{ "movie_title": "Wicked", "genre": "Drama", "hall": "Hall 2",
  "show_date": "2026-10-27", "show_time": "19:30",
  "ticket_price": 95, "available_seats": 90 }
```

## Postman (video evidence)
1. Import `postman/Cinema_Showtimes_API.postman_collection.json`.
2. Set the `baseUrl` collection variable (local or your Render URL).
3. Record your screen while running each request in order: GET all, GET one, POST, PUT, DELETE.
   Show the URL, method, request body and JSON response each time.
   Tip: after POST, copy the new `id` into the `id` variable before running PUT and DELETE.

## Deploy on Render (same way as Activity 3)
1. Push this folder to a GitHub repo.
2. Render > New > Web Service > connect the repo.
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Environment variables: `DB_PATH=./cinema.db`, `CORS_ORIGIN=*` (Render sets PORT itself).
6. Your links to submit:
   - Site: `https://<your-service>.onrender.com`
   - GET all: `https://<your-service>.onrender.com/api/showtimes`
   - GET one: `https://<your-service>.onrender.com/api/showtimes/1`
   - POST / PUT / DELETE use the same URLs with the matching method.

Note: on Render's free tier the SQLite file resets when the service restarts or redeploys.
The 10 sample rows are re-created automatically, but records you add may be lost.
For permanent data, move the database to Supabase (Postgres).
