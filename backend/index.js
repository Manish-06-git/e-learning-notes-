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

/* NOTES */
app.get("/notes", auth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM notes WHERE user_id=?",
    [req.user.id]
  );
  res.json(rows);
});

app.post("/notes", auth, async (req, res) => {
  const { title, content } = req.body;
  await db.query(
    "INSERT INTO notes (user_id, title, content) VALUES (?,?,?)",
    [req.user.id, title, content]
  );
  res.json({ success: true });
});

app.put("/notes/:id", auth, async (req, res) => {
  const { title, content } = req.body;
  await db.query(
    "UPDATE notes SET title=?, content=? WHERE id=?",
    [title, content, req.params.id]
  );
  res.json({ success: true });
});

app.delete("/notes/:id", auth, async (req, res) => {
  await db.query("DELETE FROM notes WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

app.listen(5000, () =>
  console.log("✅ Backend running on http://localhost:5000")
);
