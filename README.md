# Layerline Print Queue

A Bambu Lab printer queue dashboard backed by Neon Postgres and Vercel serverless functions.

## Deploy to Vercel with Neon

1. Import this GitHub repository into Vercel, or link the folder with the Vercel CLI.
2. Create or select a Neon Postgres database in the Vercel project integrations. Add `DATABASE_URL` as a Vercel environment variable (use the pooled connection string from Neon; keep it server-side).
3. Run [`migrations/001_create_jobs.sql`](migrations/001_create_jobs.sql), [`migrations/002_admin_settings.sql`](migrations/002_admin_settings.sql), [`migrations/003_job_purpose_filament.sql`](migrations/003_job_purpose_filament.sql), [`migrations/004_admin_booking_options.sql`](migrations/004_admin_booking_options.sql), and [`migrations/005_printer_fleet.sql`](migrations/005_printer_fleet.sql) in order against that Neon database.
4. Add `ADMIN_PIN` in Vercel Project Settings → Environment Variables and set it to your chosen admin PIN. Keep it server-side; do not put it in browser code.
5. Redeploy. The app reads bookings, printer settings, and remembered names from Neon. The dashboard shows a date-selectable booking calendar and current scheduled availability for each of the three printers. The gear icon opens admin settings to rename/enable printers, edit saved user names and booking dropdown choices (purposes, filament types, colors, durations, and start times), and remove queue bookings.

For local development, install Node.js, run `npm install`, copy `.env.example` to `.env` with your Neon connection string and `ADMIN_PIN`, run migrations 001 through 005 against the same database, then run `npm run dev`.

The API validates bookings and rejects overlapping reservations on the same printer. Printer availability on the page is calculated from scheduled jobs; it is not live Bambu Lab telemetry. The admin PIN protects printer and saved-user edits, booking-option changes, and queue removal. Public queue access still allows anyone with the app URL to view and add bookings; add member sign-in before using it with private workshop data.

