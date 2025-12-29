import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const { Pool } = pg;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Music Backend API" });
});

/* ----------------------------------------------------
   GET ALL ALBUMS
---------------------------------------------------- */
app.get("/albums", (req, res) => {
  const q = "SELECT * FROM albums ORDER BY id ASC";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json(data.rows);
  });
});

/* ----------------------------------------------------
   ADD NEW CONTACT
---------------------------------------------------- */
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const q = "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING *";

  db.query(q, [name, email, message], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(201).json(data.rows[0]);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
