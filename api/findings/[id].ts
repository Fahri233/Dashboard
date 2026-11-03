import type { VercelRequest, VercelResponse } from '../_types';
import { getTursoClient, initDatabase, rowToFinding } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = getTursoClient();
  if (!db) {
    return res.status(500).json({ error: 'Database tidak tersedia.' });
  }

  const { id } = req.query as { id: string };
  if (!id) {
    return res.status(400).json({ error: 'ID diperlukan' });
  }

  try {
    await initDatabase(db);

    if (req.method === 'GET') {
      const result = await db.execute({
        sql: 'SELECT * FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
        args: [id, id],
      });
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Temuan tidak ditemukan' });
      }
      return res.status(200).json({ success: true, data: rowToFinding(result.rows[0]) });
    }

    if (req.method === 'PUT') {
      const item = req.body;
      if (!item) {
        return res.status(400).json({ error: 'Body kosong' });
      }

      await db.execute({
        sql: `UPDATE findings SET
          tanggal = ?, tanggal_iso = ?, lokasi = ?, aktivitas = ?,
          potensi_bahaya = ?, kategori = ?, tingkat_risiko = ?,
          pengendalian = ?, status = ?, keterangan = ?,
          raw_kategori = ?, raw_pengendalian = ?, raw_potensi_bahaya = ?, raw_tanggal = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? OR CAST(no AS TEXT) = ?`,
        args: [
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
          id,
          id,
        ],
      });

      const updated = await db.execute({
        sql: 'SELECT * FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
        args: [id, id],
      });

      if (updated.rows.length === 0) {
        return res.status(404).json({ error: 'Temuan tidak ditemukan' });
      }
      return res.status(200).json({ success: true, data: rowToFinding(updated.rows[0]) });
    }

    if (req.method === 'DELETE') {
      const existing = await db.execute({
        sql: 'SELECT id FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
        args: [id, id],
      });
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Temuan tidak ditemukan' });
      }

      await db.execute({
        sql: 'DELETE FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
        args: [id, id],
      });

      return res.status(200).json({ success: true, message: 'Temuan berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err: any) {
    console.error(`API /api/findings/${id} error:`, err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

