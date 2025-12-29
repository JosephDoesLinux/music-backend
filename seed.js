import pg from "pg";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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
