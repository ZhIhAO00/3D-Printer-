import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function reply(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

function authorized(req) {
  const configuredPin = process.env.ADMIN_PIN;
  const submittedPin = req.headers['x-admin-pin'];
  return Boolean(configuredPin && typeof submittedPin === 'string' && submittedPin === configuredPin);
}

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) return reply(res, 503, { error: 'Database is not configured.' });
  if (!process.env.ADMIN_PIN) return reply(res, 503, { error: 'Set ADMIN_PIN in Vercel Environment Variables to enable admin settings.' });
  if (!authorized(req)) return reply(res, 401, { error: 'Incorrect admin PIN.' });

  try {
    if (req.method === 'GET') {
      const [printers, users] = await Promise.all([
        sql`SELECT id, name, unit, enabled, color FROM printers ORDER BY id`,
        sql`SELECT id, name FROM queue_users ORDER BY lower(name)`
      ]);
      return reply(res, 200, { printers, users });
    }

    if (req.method === 'PUT') {
      const { printers = [], users = [] } = req.body || {};
      if (!Array.isArray(printers) || !Array.isArray(users)) return reply(res, 400, { error: 'Invalid settings.' });

      for (const printer of printers) {
        if (!printer || typeof printer.id !== 'string' || typeof printer.name !== 'string' || !printer.name.trim() || typeof printer.unit !== 'string' || !printer.unit.trim() || typeof printer.enabled !== 'boolean') {
          return reply(res, 400, { error: 'Each printer needs a name, unit, and enabled setting.' });
        }
        await sql`UPDATE printers SET name = ${printer.name.trim()}, unit = ${printer.unit.trim()}, enabled = ${printer.enabled} WHERE id = ${printer.id}`;
      }

      for (const user of users) {
        if (!user || !Number.isInteger(Number(user.id)) || typeof user.name !== 'string' || !user.name.trim()) {
          return reply(res, 400, { error: 'Each saved user needs a name.' });
        }
        const [previous] = await sql`SELECT name FROM queue_users WHERE id = ${Number(user.id)}`;
        if (!previous) return reply(res, 404, { error: 'A saved user could not be found. Refresh and try again.' });
        await sql`UPDATE queue_users SET name = ${user.name.trim()} WHERE id = ${Number(user.id)}`;
        if (previous.name !== user.name.trim()) await sql`UPDATE jobs SET person = ${user.name.trim()} WHERE person = ${previous.name}`;
      }

      return reply(res, 200, { message: 'Admin settings saved.' });
    }

    res.setHeader('Allow', 'GET, PUT');
    return reply(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error('Admin settings error:', error);
    if (error.code === '23505') return reply(res, 409, { error: 'That name is already in the saved users list. Choose a unique name.' });
    if (error.code === '42P01' || error.code === '42703') return reply(res, 503, { error: 'Admin tables are missing. Run migrations/002_admin_settings.sql in the Neon SQL Editor, then redeploy.' });
    return reply(res, 500, { error: 'Settings could not be saved. Check the Vercel function logs for the database error.' });
  }
}
