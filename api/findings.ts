import type { VercelRequest, VercelResponse } from './_types';
import { getTursoClient, initDatabase, rowToFinding } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = getTursoClient();
  if (!db) {
    return res.status(500).json({ error: 'Database tidak tersedia. Periksa environment variables.' });
  }

  try {
    await initDatabase(db);

    if (req.method === 'GET') {
      const result = await db.execute('SELECT * FROM findings ORDER BY no ASC');
      const findings = result.rows.map(rowToFinding);
      return res.status(200).json({ success: true, data: findings });
    }

    if (req.method === 'POST') {
      const item = req.body;
      if (!item) {
        return res.status(400).json({ error: 'Body kosong' });
      }

      // Generate id if not provided
      const id = item.id || `K3-${item.no}-${Date.now()}`;

      await db.execute({
        sql: `INSERT INTO findings (
          id, no, tanggal, tanggal_iso, lokasi, aktivitas, potensi_bahaya,
          kategori, tingkat_risiko, pengendalian, status, keterangan,
          raw_kategori, raw_pengendalian, raw_potensi_bahaya, raw_tanggal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          item.no,
          item.tanggal,
          item.tanggalIso || item.tanggal,
          item.lokasi,
          item.aktivitas,
          item.potensiBahaya,
          item.kategori,
          item.tingkatRisiko,
          item.pengendalian,
          item.status,
          item.keterangan || '-',
          item.raw?.kategori || null,
          item.raw?.pengendalian || null,
          item.raw?.potensiBahaya || null,
          item.raw?.tanggal || null,
        ],
      });

      const inserted = await db.execute({
        sql: 'SELECT * FROM findings WHERE id = ?',
        args: [id],
      });

      return res.status(201).json({ success: true, data: rowToFinding(inserted.rows[0]) });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err: any) {
    console.error('API /api/findings error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

