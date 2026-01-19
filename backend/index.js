console.log("🔥🔥 THIS IS THE CORRECT BACKEND FILE RUNNING 🔥🔥");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "elearn_secret";

/* REGISTER */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.query(
      "INSERT INTO users (email, password) VALUES (?,?)",
      [email, hash]
    );
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email=?",
    [email]
  );

  if (!rows.length) return res.status(401).json({ error: "Invalid login" });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid login" });

  const token = jwt.sign({ id: user.id }, SECRET);
  res.json({ token });
});

/* AUTH MIDDLEWARE */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

/* ================= NOTES ================= */

/* GET NOTES */
app.get("/notes", auth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM notes WHERE user_id=?",
    [req.user.id]
  );
  res.json(rows);
});

/* CREATE NOTE (with status) */
app.post("/notes", auth, async (req, res) => {
  const { title, content, status } = req.body;
  await db.query(
    "INSERT INTO notes (user_id, title, content, status) VALUES (?,?,?,?)",
    [req.user.id, title, content, status || "Pending"]
  );
  res.json({ success: true });
});

/* UPDATE NOTE + SAVE VERSION */
app.put("/notes/:id", auth, async (req, res) => {
  const { title, content, status } = req.body;

  // Save old version before updating
  const [old] = await db.query(
    "SELECT content FROM notes WHERE id=? AND user_id=?",
    [req.params.id, req.user.id]
  );

  if (old.length > 0) {
    await db.query(
      "INSERT INTO note_versions (note_id, content) VALUES (?, ?)",
      [req.params.id, old[0].content]
    );
  }

  // Update note
  await db.query(
    "UPDATE notes SET title=?, content=?, status=? WHERE id=? AND user_id=?",
    [title, content, status, req.params.id, req.user.id]
  );

  res.json({ success: true });
});

/* DELETE NOTE */
app.delete("/notes/:id/versions", auth, async (req, res) => {
  console.log("🔥 DELETE HISTORY API HIT FOR NOTE:", req.params.id);

  await db.query(
    "DELETE FROM note_versions WHERE note_id=?",
    [req.params.id]
  );

  res.json({ success: true });
});


/* ================= VERSION HISTORY ================= */

/* GET ALL VERSIONS OF A NOTE */
app.get("/notes/:id/versions", auth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM note_versions WHERE note_id=? ORDER BY saved_at DESC",
    [req.params.id]
  );
  res.json(rows);
});
app.delete("/notes/:id/versions", auth, async (req, res) => {
  await db.query(
    "DELETE nv FROM note_versions nv JOIN notes n ON nv.note_id = n.id WHERE nv.note_id=? AND n.user_id=?",
    [req.params.id, req.user.id]
  );

  res.json({ success: true });
});


/* RESTORE A VERSION */
app.post("/notes/:id/restore", auth, async (req, res) => {
  const { content } = req.body;

  await db.query(
    "UPDATE notes SET content=? WHERE id=? AND user_id=?",
    [content, req.params.id, req.user.id]
  );

  res.json({ success: true });
});

/* ================= SEARCH ================= */

/* SEARCH NOTES */
app.get("/search", auth, async (req, res) => {
  const q = `%${req.query.q}%`;
  const [rows] = await db.query(
    "SELECT * FROM notes WHERE user_id=? AND (title LIKE ? OR content LIKE ?)",
    [req.user.id, q, q]
  );
  res.json(rows);
});

/* ================= START SERVER ================= */

app.listen(5000, () =>
  console.log("✅ Backend running on http://localhost:5000")
);
