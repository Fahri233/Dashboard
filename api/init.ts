import type { VercelRequest, VercelResponse } from './_types';
import { getTursoClient, initDatabase } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = getTursoClient();
  if (!db) {
    return res.status(500).json({
      error: 'Database tidak tersedia. Periksa environment variables TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN.',
    });
  }

  try {
    await initDatabase(db);
    const result = await db.execute('SELECT COUNT(*) as count FROM findings');
    const count = Number(result.rows[0].count);

    return res.status(200).json({
      success: true,
      message: `Database siap. Total temuan: ${count}`,
      count,
    });
  } catch (err: any) {
    console.error('API /api/init error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

