import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

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

    // Insert Albums from Dump
    const insertQueries = [
      `INSERT INTO public.albums VALUES (2, 'Habibi Funk 031: A Selection Of Music From Libyan Tapes', 'Various Artists', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-031-a-selection-of-music-from-libyan-tapes', 'https://f4.bcbits.com/img/a0933768371_2.jpg', '2025-12-29 21:52:46.724512');`,
      `INSERT INTO public.albums VALUES (3, 'Habibi Funk 030: Hawalat', 'Charif Megarbane', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-030-hawalat', 'https://f4.bcbits.com/img/a3034887417_2.jpg', '2025-12-29 21:52:46.824829');`,
      `INSERT INTO public.albums VALUES (4, 'Habibi Funk 029: Samh Almea''ad', 'Cheb Bakr', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-029-samh-almeaad', 'https://f4.bcbits.com/img/a2848262659_2.jpg', '2025-12-29 21:52:46.923853');`,
      `INSERT INTO public.albums VALUES (5, 'Habibi Funk Limited 002: Hamra / Red', 'Charif Megarbane', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-limited-002-hamra-red', 'https://f4.bcbits.com/img/a3559157440_2.jpg', '2025-12-29 21:52:47.030616');`,
      `INSERT INTO public.albums VALUES (6, 'Habibi Funk 027: Musique Originale De Films (Volume 2)', 'Ahmed Malek', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-027-musique-originale-de-films-volume-2', 'https://f4.bcbits.com/img/a3182835865_2.jpg', '2025-12-29 21:52:47.215957');`,
      `INSERT INTO public.albums VALUES (7, 'Habibi Funk 025: East of Any Place', 'Rogér Fakhr', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-025-east-of-any-place', 'https://f4.bcbits.com/img/a0205422707_2.jpg', '2025-12-29 21:52:47.412983');`,
      `INSERT INTO public.albums VALUES (8, 'Habibi Funk 026: Solidarity with Libya', 'Various Artists', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-026-solidarity-with-libya', 'https://f4.bcbits.com/img/a2297884769_2.jpg', '2025-12-29 21:52:47.54272');`,
      `INSERT INTO public.albums VALUES (9, 'Habibi Funk 024: The Father of Libyan Reggae', 'Ibrahim Hesnawi', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-024-the-father-of-libyan-reggae', 'https://f4.bcbits.com/img/a2761907669_2.jpg', '2025-12-29 21:52:47.713195');`,
      `INSERT INTO public.albums VALUES (10, 'Habibi Funk 023: Marzipan', 'Charif Megarbane', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-023-marzipan', 'https://f4.bcbits.com/img/a2839615640_2.jpg', '2025-12-29 21:52:47.776282');`,
      `INSERT INTO public.albums VALUES (11, 'Habibi Funk 022: Subhana', 'Ahmed Ben Ali', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-022-subhana', 'https://f4.bcbits.com/img/a3873739876_2.jpg', '2025-12-29 21:52:47.849703');`,
      `INSERT INTO public.albums VALUES (12, 'Habibi Funk 021: Free Music (Part 1)', 'The Free Music', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-021-free-music-part-1', 'https://f4.bcbits.com/img/a3282214348_2.jpg', '2025-12-29 21:52:47.950716');`,
      `INSERT INTO public.albums VALUES (13, 'Tayyara Warak', 'Charif Megarbane', 'https://habibifunkrecords.bandcamp.com/album/tayyara-warak', 'https://f4.bcbits.com/img/a2449313503_2.jpg', '2025-12-29 21:52:48.056577');`,
      `INSERT INTO public.albums VALUES (14, 'Habibi Funk 020: Orkos', 'Maha', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-020-orkos', 'https://f4.bcbits.com/img/a2477830465_2.jpg', '2025-12-29 21:52:48.154593');`,
      `INSERT INTO public.albums VALUES (15, 'Habibi Funk 019: Oghneya', 'Ferkat Al Ard', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-019-oghneya', 'https://f4.bcbits.com/img/a2212652305_2.jpg', '2025-12-29 21:52:48.2595');`,
      `INSERT INTO public.albums VALUES (16, 'Habibi Funk 018: The SLAM! Years (1983 - 1988)', 'Hamid El Shaeri', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-018-the-slam-years-1983-1988', 'https://f4.bcbits.com/img/a0130913908_2.jpg', '2025-12-29 21:52:48.362404');`,
      `INSERT INTO public.albums VALUES (17, 'Habibi Funk 017: Chant Amazigh', 'Majid Soula', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-017-chant-amazigh', 'https://f4.bcbits.com/img/a2599307222_2.jpg', '2025-12-29 21:52:48.465151');`,
      `INSERT INTO public.albums VALUES (18, 'Habibi Funk 016: Fine Anyway', 'Rogér Fakhr', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-016-fine-anyway-2', 'https://f4.bcbits.com/img/a2697031363_2.jpg', '2025-12-29 21:52:48.56659');`,
      `INSERT INTO public.albums VALUES (19, 'Habibi Funk 015: An eclectic selection of music from the Arab world, part 2', 'Various Artists', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-015-an-eclectic-selection-of-music-from-the-arab-world-part-2', 'https://f4.bcbits.com/img/a2911442712_2.jpg', '2025-12-29 21:52:48.664159');`,
      `INSERT INTO public.albums VALUES (20, 'Habibi Funk 013: The King Of Sudanese Jazz', 'Sharhabil Ahmed', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-013-the-king-of-sudanese-jazz', 'https://f4.bcbits.com/img/a3893589837_2.jpg', '2025-12-29 21:52:48.770539');`,
      `INSERT INTO public.albums VALUES (1, 'Habibi Funk 033: Bourj Hammoud Groove', 'Ara Kekedjian', 'https://habibifunkrecords.bandcamp.com/album/habibi-funk-033-bourj-hammoud-groove', 'https://f4.bcbits.com/img/a3296700033_2.jpg', '2025-12-29 21:52:46.620558');`,
    ];

    for (const query of insertQueries) {
      await client.query(query);
    }
    console.log("Inserted albums from dump.");

    // Update Sequence
    await client.query("SELECT setval('albums_id_seq', (SELECT MAX(id) FROM albums));");
    console.log("Updated albums_id_seq.");

    console.log("Seeding complete!");
    
    client.release();
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await pool.end();
  }
}

seed();
