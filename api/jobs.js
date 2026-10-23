import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function respond(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) return respond(res, 503, { error: 'Database is not configured.' });

  try {
    if (req.method === 'GET') {
      const jobs = await sql`SELECT id, project, person, printer, to_char(start_time, 'HH24:MI') AS start, duration, material, status, to_char(job_date, 'YYYY-MM-DD') AS date FROM jobs ORDER BY job_date, start_time`;
      return respond(res, 200, { jobs });
    }

    if (req.method === 'POST') {
      const { project, person, printer, start, duration, material, date } = req.body || {};
      if (![project, person, printer, start, material, date].every(v => typeof v === 'string' && v.trim()) || !Number.isFinite(Number(duration)) || Number(duration) <= 0 || Number(duration) > 48 || !/^\d{2}:\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return respond(res, 400, { error: 'Please provide valid booking details.' });
      }

      const [availablePrinter] = await sql`SELECT id FROM printers WHERE id = ${printer.trim()} AND enabled = true`;
      if (!availablePrinter) return respond(res, 400, { error: 'That printer is currently unavailable. Refresh the printer list and choose another.' });
      await sql`INSERT INTO queue_users (name) VALUES (${person.trim()}) ON CONFLICT (name) DO NOTHING`;

      const [job] = await sql`
        INSERT INTO jobs (project, person, printer, start_time, duration, material, job_date)
        SELECT ${project.trim()}, ${person.trim()}, ${printer.trim()}, ${start}::time, ${Number(duration)}, ${material.trim()}, ${date}::date
        WHERE NOT EXISTS (
          SELECT 1 FROM jobs j
          WHERE j.printer = ${printer.trim()} AND j.job_date = ${date}::date
            AND ${start}::time < j.start_time + j.duration * interval '1 hour'
            AND j.start_time < ${start}::time + ${Number(duration)} * interval '1 hour'
        )
        RETURNING id, project, person, printer, to_char(start_time, 'HH24:MI') AS start, duration, material, status, to_char(job_date, 'YYYY-MM-DD') AS date`;
      if (!job) return respond(res, 409, { error: 'That printer already has a booking during this time. Refresh the queue and choose another slot.' });
      return respond(res, 201, { job });
    }

    res.setHeader('Allow', 'GET, POST');
    return respond(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error('Queue API error:', error);
    return respond(res, 500, { error: 'The queue could not be loaded or saved.' });
  }
}
