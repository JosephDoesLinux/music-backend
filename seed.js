import pg from "pg";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust the path to where your albums.json is located
const albumsFilePath = path.join(__dirname, "../music-app/src/data/albums.json");

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    url TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createContactsTableQuery = `
  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createFavoritesTableQuery = `
  CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, album_id)
  );
`;

const insertAlbumQuery = `
  INSERT INTO albums (title, artist, url, image_url)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
`;

async function seed() {
  try {
    // Connect
    const client = await pool.connect();
    console.log("Connected to database...");

    // Create Table
    await client.query(createTableQuery);
    console.log("Table 'albums' created or already exists.");

    await client.query(createContactsTableQuery);
    console.log("Table 'contacts' created or already exists.");

    await client.query(createUsersTableQuery);
    console.log("Table 'users' created or already exists.");

    await client.query(createFavoritesTableQuery);
    console.log("Table 'favorites' created or already exists.");

    // Clear existing data to prevent duplicates
    // We use CASCADE to clear favorites when users/albums are cleared
    await client.query("TRUNCATE TABLE albums, users RESTART IDENTITY CASCADE");
    console.log("Cleared existing albums and users.");

    // Insert Admin User
    await client.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
      ["admin", "admin", "admin"]
    );
    console.log("Admin user created (admin/admin).");

    // Read JSON file
    try {
        const data = await fs.readFile(albumsFilePath, "utf-8");
        const albums = JSON.parse(data);

        // Insert Data
        for (const album of albums) {
        await client.query(insertAlbumQuery, [
            album.title,
            album.artist,
            album.url,
            album.image_url,
        ]);
        console.log(`Inserted: ${album.title}`);
        }

        console.log("Seeding complete!");
    } catch (fileError) {
        console.error(`Error reading file at ${albumsFilePath}:`, fileError.message);
        console.log("Please ensure the path to albums.json is correct.");
    }
    
    client.release();
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await pool.end();
  }
}

seed();
