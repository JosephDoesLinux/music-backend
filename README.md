# Music Backend API

## Project Overview
This is the backend server for the **Habibi Punk** https://github.com/JosephDoesLinux/music-app.git web application. It provides an API to manage albums, users, favorites, and contact form submissions. Built with Node.js and Express, it connects to a PostgreSQL database to persist data.

**Key Features:**
- **User Authentication:** Secure login and registration endpoints.
- **Album Management:** CRUD operations for managing the music catalog.
- **User Management:** Admin capabilities to view users and manage roles.
- **Favorites System:** Functionality for users to like/unlike albums.
- **Contact Form:** Handling of contact form submissions.

---

## Technologies Used
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Libraries:** `pg` (PostgreSQL client), `cors`, `dotenv`

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JosephDoesLinux/music-backend.git
   cd music-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory and add your database connection string:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

4. **Seed the Database:**
   Populate the database with initial data (tables and sample albums):
   ```bash
   node seed.js
   ```

5. **Run the Server:**
   ```bash
   npm start
   ```
   The server will start on port **5000** (default).

---

## API Endpoints

### Authentication
- `POST /register` - Create a new user account.
- `POST /login` - Authenticate a user.

### Albums
- `GET /albums` - Retrieve all albums.
- `POST /albums` - Add a new album (Admin).
- `PUT /albums/:id` - Update an album (Admin).
- `DELETE /albums/:id` - Delete an album (Admin).

### Users & Favorites
- `GET /users` - List all users (Admin).
- `PUT /users/:id` - Update user role (Admin).
- `DELETE /users/:id` - Delete a user (Admin).
- `GET /favorites/:userId` - Get a user's favorite albums.
- `POST /favorites` - Toggle favorite status for an album.

### Contacts
- `POST /contact` - Submit a contact message.
- `GET /contacts` - View all messages (Admin).
- `DELETE /contacts/:id` - Delete a message (Admin).

---

## Live Demo
The API is deployed at: [https://music-backend-latest.onrender.com](https://music-backend-latest.onrender.com)

---

## Author
Joseph Abou Antoun – 52330567 - Lebanese International University, CSCI426
