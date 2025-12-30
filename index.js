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
   LOGIN
---------------------------------------------------- */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const pgQuery = "SELECT * FROM users WHERE username = $1 AND password = $2";

  db.query(pgQuery, [username, password], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (data.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const user = data.rows[0];
    // Don't send password back
    const { password: _, ...userInfo } = user;
    return res.status(200).json(userInfo);
  });
});

/* ----------------------------------------------------
   REGISTER
---------------------------------------------------- */
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  const checkQuery = "SELECT * FROM users WHERE username = $1";
  db.query(checkQuery, [username], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (data.rows.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Insert new user
    // Default role is 'user'
    const insertQuery = "INSERT INTO users (username, password, role) VALUES ($1, $2, 'user') RETURNING id, username, role, created_at";
    db.query(insertQuery, [username, password], (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      return res.status(201).json(data.rows[0]);
    });
  });
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

/* ----------------------------------------------------
   ADMIN: GET ALL CONTACTS
---------------------------------------------------- */
app.get("/contacts", (req, res) => {
  const q = "SELECT * FROM contacts ORDER BY created_at DESC";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json(data.rows);
  });
});

/* ----------------------------------------------------
   ADMIN: DELETE CONTACT
---------------------------------------------------- */
app.delete("/contacts/:id", (req, res) => {
  const id = req.params.id;
  const q = "DELETE FROM contacts WHERE id = $1";

  db.query(q, [id], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json({ message: "Message deleted successfully" });
  });
});

/* ----------------------------------------------------
   ADMIN: ADD ALBUM
---------------------------------------------------- */
app.post("/albums", (req, res) => {
  const { title, artist, url, image_url } = req.body;
  const q = "INSERT INTO albums (title, artist, url, image_url) VALUES ($1, $2, $3, $4) RETURNING *";

  db.query(q, [title, artist, url, image_url], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(201).json(data.rows[0]);
  });
});

/* ----------------------------------------------------
   ADMIN: UPDATE ALBUM
---------------------------------------------------- */
app.put("/albums/:id", (req, res) => {
  const id = req.params.id;
  const { title, artist, url, image_url } = req.body;
  const q = "UPDATE albums SET title = $1, artist = $2, url = $3, image_url = $4 WHERE id = $5";

  db.query(q, [title, artist, url, image_url, id], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json({ message: "Album updated successfully" });
  });
});

/* ----------------------------------------------------
   ADMIN: DELETE ALBUM
---------------------------------------------------- */
app.delete("/albums/:id", (req, res) => {
  const id = req.params.id;
  const q = "DELETE FROM albums WHERE id = $1";

  db.query(q, [id], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json({ message: "Album deleted successfully" });
  });
});

/* ----------------------------------------------------
   ADMIN: GET ALL USERS
---------------------------------------------------- */
app.get("/users", (req, res) => {
  const q = "SELECT id, username, role, created_at FROM users ORDER BY id ASC";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json(data.rows);
  });
});

/* ----------------------------------------------------
   ADMIN: UPDATE USER ROLE
---------------------------------------------------- */
app.put("/users/:id", (req, res) => {
  const id = req.params.id;
  const { role } = req.body;
  const q = "UPDATE users SET role = $1 WHERE id = $2";

  db.query(q, [role, id], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json({ message: "User role updated successfully" });
  });
});

/* ----------------------------------------------------
   ADMIN: DELETE USER
---------------------------------------------------- */
app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  const q = "DELETE FROM users WHERE id = $1";

  db.query(q, [id], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  });
});

/* ----------------------------------------------------
   FAVORITES: GET USER FAVORITES
---------------------------------------------------- */
app.get("/favorites/:userId", (req, res) => {
  const userId = req.params.userId;
  const q = "SELECT album_id FROM favorites WHERE user_id = $1";

  db.query(q, [userId], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    // Return array of IDs like [1, 5, 12]
    const favoriteIds = data.rows.map(row => row.album_id);
    return res.status(200).json(favoriteIds);
  });
});

/* ----------------------------------------------------
   FAVORITES: TOGGLE FAVORITE
---------------------------------------------------- */
app.post("/favorites", (req, res) => {
  const { userId, albumId } = req.body;
  
  // Check if exists
  const checkQ = "SELECT * FROM favorites WHERE user_id = $1 AND album_id = $2";
  
  db.query(checkQ, [userId, albumId], (err, data) => {
    if (err) return res.status(500).json(err);
    
    if (data.rows.length > 0) {
      // Exists -> Delete it (Unfavorite)
      const deleteQ = "DELETE FROM favorites WHERE user_id = $1 AND album_id = $2";
      db.query(deleteQ, [userId, albumId], (err2) => {
        if (err2) return res.status(500).json(err2);
        return res.status(200).json({ message: "Removed from favorites", action: "removed" });
      });
    } else {
      // Doesn't exist -> Add it (Favorite)
      const insertQ = "INSERT INTO favorites (user_id, album_id) VALUES ($1, $2)";
      db.query(insertQ, [userId, albumId], (err2) => {
        if (err2) return res.status(500).json(err2);
        return res.status(201).json({ message: "Added to favorites", action: "added" });
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
