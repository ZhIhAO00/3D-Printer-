import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Database is not configured.' });
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const users = await sql`SELECT id, name FROM queue_users ORDER BY lower(name)`;
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Saved users error:', error);
    return res.status(500).json({ error: 'Saved names could not be loaded.' });
  }
}
