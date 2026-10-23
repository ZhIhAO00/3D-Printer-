# Layerline Print Queue

A Bambu Lab printer queue dashboard backed by Neon Postgres and Vercel serverless functions.

## Deploy to Vercel with Neon

1. Import this GitHub repository into Vercel, or link the folder with the Vercel CLI.
2. Create or select a Neon Postgres database in the Vercel project integrations. Add `DATABASE_URL` as a Vercel environment variable (use the pooled connection string from Neon; keep it server-side).
3. Run [`migrations/001_create_jobs.sql`](migrations/001_create_jobs.sql) against that Neon database once.
4. Redeploy. The app reads bookings from `/api/jobs` and writes new bookings to Neon. `GET /api/printers` supplies the starter fleet; edit `api/printers.js` to match your printers.

For local development, install Node.js, run `npm install`, copy `.env.example` to `.env` with your Neon connection string, run the migration against the same database, then run `npm run dev`.

The API validates bookings and rejects overlapping reservations on the same printer. The queue is shared by everyone who can access the app; add authentication before using it with sensitive or private workshop data.
