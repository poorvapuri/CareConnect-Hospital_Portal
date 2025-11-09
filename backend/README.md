Environment variables for CareConnect backend

This folder expects runtime configuration via a `.env` file or environment variables.

Quick setup (local development):

1. Copy the example file and fill values:

   cp .env.example .env
   # then edit .env and add your real DATABASE_URL and JWT_SECRET

2. Install dependencies and start the server:

   npm install
   npm run dev   # uses nodemon, or `npm start` to run once

3. Verify connection:

   The backend prints environment and database connection diagnostic information on startup (see `backend/config/database.js`). If `DATABASE_URL` is not set or the connection fails, the process will log the error.

Security notes:
- Never commit `.env` to source control. The `backend/.gitignore` already excludes `.env` files.
- For production, set secrets using your hosting platform's secret manager or environment configuration.
