// If the frontend is hosted separately from the API, set this before loading app.js:
//   <script>window.API_BASE = "https://your-api.onrender.com";</script>
const API_BASE = window.API_BASE || "";
const API = `${API_BASE}/api/showtimes`;

const form = document.getElementById("showtime-form");
const rowsEl = document.getElementById("rows");
const emptyEl = document.getElementById("empty");
const messageEl = document.getElementById("message");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");

const FIELDS = ["movie_title", "genre", "hall", "show_date", "show_time", "ticket_price", "available_seats"];
const input = (id) => document.getElementById(id);

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = type || "";
}

async function request(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

// READ: load and draw all records
async function loadShowtimes() {
  try {
    const data = await request(API);
    rowsEl.innerHTML = "";
    emptyEl.hidden = data.length > 0;
    data.forEach((s) => rowsEl.appendChild(buildRow(s)));
  } catch (err) {
    showMessage(`Could not load showtimes: ${err.message}`, "err");
  }
}

function cell(text, className) {
  const td = document.createElement("td");
  td.textContent = text ?? "";
  if (className) td.className = className;
  return td;
}

function buildRow(s) {
  const tr = document.createElement("tr");
  tr.appendChild(cell(s.id));
  tr.appendChild(cell(s.movie_title, "title"));
  tr.appendChild(cell(s.genre));
  tr.appendChild(cell(s.hall));
  tr.appendChild(cell(s.show_date));
  tr.appendChild(cell(s.show_time));
  tr.appendChild(cell(Number(s.ticket_price).toFixed(2)));
  tr.appendChild(cell(s.available_seats, s.available_seats < 20 ? "seats-low" : ""));

  const actions = document.createElement("td");
  actions.className = "row-actions";
  const edit = document.createElement("button");
  edit.className = "ghost small";
  edit.textContent = "Edit";
  edit.addEventListener("click", () => startEdit(s));
  const del = document.createElement("button");
  del.className = "danger small";
  del.textContent = "Delete";
  del.addEventListener("click", () => removeShowtime(s));
  actions.append(edit, del);
  tr.appendChild(actions);
  return tr;
}

// Load a record into the form for editing
function startEdit(s) {
  input("id").value = s.id;
  FIELDS.forEach((f) => (input(f).value = s[f] ?? ""));
  formTitle.textContent = `Edit showtime #${s.id}`;
  saveBtn.textContent = "Save changes";
  cancelBtn.hidden = false;
  showMessage("", "");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  input("movie_title").focus();
}

function resetForm() {
  form.reset();
  input("id").value = "";
  input("ticket_price").value = 0;
  input("available_seats").value = 0;
  formTitle.textContent = "Add a showtime";
  saveBtn.textContent = "Add showtime";
  cancelBtn.hidden = true;
}

// CREATE / UPDATE
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {};
  FIELDS.forEach((f) => (payload[f] = input(f).value));
  const id = input("id").value;
  try {
    if (id) {
      await request(`${API}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      showMessage("Showtime updated.", "ok");
    } else {
      await request(API, { method: "POST", body: JSON.stringify(payload) });
      showMessage("Showtime added.", "ok");
    }
    resetForm();
    await loadShowtimes();
  } catch (err) {
    showMessage(err.message, "err");
  }
});

cancelBtn.addEventListener("click", () => {
  resetForm();
  showMessage("", "");
});

// DELETE
async function removeShowtime(s) {
  if (!confirm(`Delete "${s.movie_title}" (${s.show_date} ${s.show_time})?`)) return;
  try {
    await request(`${API}/${s.id}`, { method: "DELETE" });
    showMessage("Showtime deleted.", "ok");
    if (input("id").value === String(s.id)) resetForm();
    await loadShowtimes();
  } catch (err) {
    showMessage(err.message, "err");
  }
}

loadShowtimes();
