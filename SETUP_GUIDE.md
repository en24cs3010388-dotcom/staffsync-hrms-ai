# StaffSync Setup and Execution Guide

## 1. Prerequisites
- Node.js version compatible with the project's Vite version.
- npm.
- MongoDB Atlas or a local MongoDB service, depending on the environment.
- Git (optional, for source control).

## 2. Project Folder
The primary documented layout is the repository root:
- `server.ts`: Express/Vite entry point.
- `server/config/`: database and seed configuration.
- `server/controllers/`: request handlers/business logic.
- `server/middleware/`: authentication, role authorization, and error handling.
- `server/models/`: Mongoose schemas.
- `server/routes/`: API route definitions.
- `src/`: React client.
- `index.html`, `vite.config.ts`: Vite configuration.

The ZIP also contains a nested `staffsync-hrms/` copy. Avoid mixing commands or files between these layouts. Confirm which folder is deployed before changing the structure.

## 3. Install Dependencies
From the repository root, run:

```bash
npm install
```

## 4. Environment Configuration
Create a local `.env` file from `.env.example` only after ensuring the example contains placeholders, not real credentials. Set the following variables in the local environment or deployment secret manager:

```env
PORT=3000
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<a long random secret>
```

`GEMINI_API_KEY` and `APP_URL` are present in the example configuration, but do not add or configure them unless the feature/deployment you use actually requires them. Never commit `.env`.

## 5. Run the Application
From the root project directory:

```bash
npm run dev
```

The root `server.ts` uses port `3000`, serves the React app through Vite middleware in development, and mounts API routes at `/api`. Open the local app at `http://localhost:3000`.

## 6. Verify It
- Open the app in the browser.
- Sign in using valid demo credentials supplied by the project seed, if available.
- Verify the dashboard.
- Test one operation from employee management, attendance, leave, announcements, and training, as appropriate for the role.
- Check `http://localhost:3000/api/health` for API/database status.

## 7. Database Fallback
The database module includes an in-memory MongoDB fallback if an external connection is unavailable. In-memory data is not persistent and may be lost when the process restarts. Confirm the health response and server logs to know which database mode is active.

## 8. Important Warning About Seeding
The seed script deletes documents from all seven application collections before inserting seed data. **Do not run `npm run seed` against a database containing data you need.** Use a disposable development database and inspect the seed script before running it.

## 9. Common Issues
- **Port unavailable:** Stop the process already using port 3000 or adapt the application intentionally and update documentation.
- **MongoDB connection timeout:** Check the URI, network access/IP allowlist, credentials, and database availability.
- **Missing packages:** Run `npm install` in the correct root folder.
- **Empty data after restart:** The app may be using its in-memory fallback rather than persistent MongoDB.
- **Login does not work:** Confirm seed data and environment configuration; do not publish passwords in documentation.

## 10. Security Before Submission
- Keep `.env` ignored by Git.
- Keep all values in `.env.example` as placeholders.
- Rotate any credential previously committed to a public repository.
- Use a unique `JWT_SECRET`; do not use a hardcoded fallback.
- Never allow documentation or screenshots to reveal secrets.
