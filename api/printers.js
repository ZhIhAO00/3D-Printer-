import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Database is not configured.' });
  try {
    const printers = await sql`SELECT id, name, unit, color, 'Configured' AS state, 0 AS hours FROM printers WHERE enabled = true ORDER BY id`;
    return res.status(200).json({ printers });
  } catch (error) {
    console.error('Printer settings error:', error);
    return res.status(500).json({ error: 'Printer settings could not be loaded.' });
  }
}
