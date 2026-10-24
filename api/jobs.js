import { neon } from '@neondatabase/serverless';
import '../lib/booking-core.js';

const validateBooking = globalThis.PrintBooking.validateBooking;

const sql = neon(process.env.DATABASE_URL);

function respond(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) return respond(res, 503, { error: 'Database is not configured.' });

  try {
    if (req.method === 'GET') {
      const [jobs, settingRows] = await Promise.all([
        sql`SELECT id, project, person, printer, to_char(start_time, 'HH24:MI') AS start, duration, purpose, filament, filament_color, status, to_char(job_date, 'YYYY-MM-DD') AS date FROM jobs ORDER BY job_date, start_time`,
        sql`SELECT setting_key, setting_value FROM queue_settings`
      ]);
      return respond(res, 200, { jobs, options: Object.fromEntries(settingRows.map(row => [row.setting_key, row.setting_value])) });
    }

    if (req.method === 'POST') {
      const { project, person, printer, start, duration, purpose, filament, filamentColor, date } = req.body || {};
      const settingRows = await sql`SELECT setting_key, setting_value FROM queue_settings`;
      const options = Object.fromEntries(settingRows.map(row => [row.setting_key, row.setting_value]));
      if (!validateBooking({ project, person, printer, start, duration, purpose, filament, filamentColor, date }, options)) {
        return respond(res, 400, { error: 'Enter a valid start time, duration, and booking details.' });
      }

      const [availablePrinter] = await sql`SELECT id FROM printers WHERE id = ${printer.trim()} AND enabled = true`;
      if (!availablePrinter) return respond(res, 400, { error: 'That printer is currently unavailable. Refresh the printer list and choose another.' });
      await sql`INSERT INTO queue_users (name) VALUES (${person.trim()}) ON CONFLICT (name) DO NOTHING`;

      const [job] = await sql`
        INSERT INTO jobs (project, person, printer, start_time, duration, material, purpose, filament, filament_color, job_date)
        SELECT ${project.trim()}, ${person.trim()}, ${printer.trim()}, ${start}::time, ${Number(duration)}, ${filament}, ${purpose}, ${filament}, ${filamentColor.trim()}, ${date}::date
        WHERE NOT EXISTS (
          SELECT 1 FROM jobs j
          WHERE j.printer = ${printer.trim()} AND j.status <> 'Complete'
            AND (${date}::date + ${start}::time) < (j.job_date + j.start_time + j.duration * interval '1 hour')
            AND (j.job_date + j.start_time) < (${date}::date + ${start}::time + ${Number(duration)} * interval '1 hour')
        )
        RETURNING id, project, person, printer, to_char(start_time, 'HH24:MI') AS start, duration, purpose, filament, filament_color, status, to_char(job_date, 'YYYY-MM-DD') AS date`;
      if (!job) return respond(res, 409, { error: 'That printer already has a booking during this time. Refresh the queue and choose another slot.' });
      return respond(res, 201, { job });
    }

    res.setHeader('Allow', 'GET, POST');
    return respond(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error('Queue API error:', error);
    if (error.code === '42P01' && error.message?.includes('queue_settings')) return respond(res, 503, { error: 'Booking options are not configured. Run migrations/004_admin_booking_options.sql in Neon.' });
    if (error.code === '42P01') return respond(res, 503, { error: 'Queue table is missing. Run migrations/001_create_jobs.sql in Neon.' });
    if (error.code === '42703') return respond(res, 503, { error: 'Database schema is out of date. Run the latest SQL migrations in Neon.' });
    return respond(res, 500, { error: 'The queue could not be loaded or saved.' });
  }
}
