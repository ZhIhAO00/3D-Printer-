# Layerline Print Queue

A Bambu Lab printer queue dashboard backed by Neon Postgres and Vercel serverless functions.

## Deploy to Vercel with Neon

1. Import this GitHub repository into Vercel, or link the folder with the Vercel CLI.
2. Create or select a Neon Postgres database in the Vercel project integrations. Add `DATABASE_URL` as a Vercel environment variable (use the pooled connection string from Neon; keep it server-side).
3. Run [`migrations/001_create_jobs.sql`](migrations/001_create_jobs.sql), then [`migrations/002_admin_settings.sql`](migrations/002_admin_settings.sql) against that Neon database.
4. Add `ADMIN_PIN` in Vercel Project Settings → Environment Variables and set it to your chosen admin PIN. Keep it server-side; do not put it in browser code.
5. Redeploy. The app reads bookings, printer settings, and remembered names from Neon. The gear icon opens admin settings to rename/enable printers and edit saved user names.

For local development, install Node.js, run `npm install`, copy `.env.example` to `.env` with your Neon connection string and `ADMIN_PIN`, run both migrations against the same database, then run `npm run dev`.

The API validates bookings and rejects overlapping reservations on the same printer. The admin PIN protects printer and saved-user edits. Public queue access still allows anyone with the app URL to view and add bookings; add member sign-in before using it with private workshop data.
