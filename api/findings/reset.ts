import type { VercelRequest, VercelResponse } from '../_types';
import { getTursoClient, initDatabase, seedFindings } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan. Gunakan POST.' });
  }

  const db = getTursoClient();
  if (!db) {
    return res.status(500).json({ error: 'Database tidak tersedia.' });
  }

  try {
    await initDatabase(db);
    await seedFindings(db);

    const result = await db.execute('SELECT COUNT(*) as count FROM findings');
    const count = Number(result.rows[0].count);

    return res.status(200).json({
      success: true,
      message: `Database berhasil direset ke data Excel. Total: ${count} temuan.`,
      count,
    });
  } catch (err: any) {
    console.error('API /api/findings/reset error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

