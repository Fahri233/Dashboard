import { createClient } from '@libsql/client/http';

const TURSO_URL =
  process.env.TURSO_DATABASE_URL ||
  'libsql://dashboard-fahri233.aws-ap-southeast-1.turso.io';
const TURSO_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM3MTY3MTcsImlkIjoiMDFhMWExZDgtZTIwMS03NzE5LWJkMDUtOTIxNDVhMzczN2EwIiwia2lkIjoiUml3czV4QW40aWV5eWVlYWpwV19uSnJfbXBoRklyb3N5eWE2YmJnZERtMCIsInJpZCI6Ijc4ODI4YjQyLWIxNzAtNDI4YS1hMDQ4LTVhNzc3NWE3MDBmOSJ9.oGGutSDRGFKwD9l7G2V2e2uaRFkCtM1IOHq574vfGyIa8zoua9ucgFFcwEiECIc6EGcg0p893hqrTxbZwbo4Ag';

function getDb() {
  return createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });
}

function rowToFinding(row: any) {
  return {
    id: String(row.id),
    no: Number(row.no),
    tanggal: String(row.tanggal),
    tanggalIso: String(row.tanggal_iso),
    lokasi: row.lokasi,
    aktivitas: String(row.aktivitas),
    potensiBahaya: String(row.potensi_bahaya),
    kategori: row.kategori,
    tingkatRisiko: row.tingkat_risiko,
    pengendalian: String(row.pengendalian),
    status: row.status,
    keterangan: String(row.keterangan || '-'),
    raw: {
      kategori: row.raw_kategori || undefined,
      pengendalian: row.raw_pengendalian || undefined,
      potensiBahaya: row.raw_potensi_bahaya || undefined,
      tanggal: row.raw_tanggal || undefined,
    },
  };
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getDb();

    // ─── GET ─────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const id = req.query?.id;
      if (id) {
        const result = await db.execute({
          sql: 'SELECT * FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
          args: [id, id],
        });
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Temuan tidak ditemukan' });
        }
        return res.status(200).json({ success: true, data: rowToFinding(result.rows[0]) });
      }

      const result = await db.execute('SELECT * FROM findings ORDER BY no ASC');
      const findings = result.rows.map(rowToFinding);
      return res.status(200).json({ success: true, data: findings });
    }

    // ─── POST (Tambah Temuan) ─────────────────────────────────────────────
    if (req.method === 'POST') {
      const item = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!item) {
        return res.status(400).json({ error: 'Body kosong' });
      }

      const maxRes = await db.execute('SELECT MAX(no) as max_no FROM findings');
      const maxNo = Number(maxRes.rows[0]?.max_no || 0);
      const safeNo = item.no && item.no > maxNo ? item.no : maxNo + 1;
      const id = item.id || `K3-${safeNo}-${Date.now()}`;

      await db.execute({
        sql: `INSERT INTO findings (
          id, no, tanggal, tanggal_iso, lokasi, aktivitas, potensi_bahaya,
          kategori, tingkat_risiko, pengendalian, status, keterangan,
          raw_kategori, raw_pengendalian, raw_potensi_bahaya, raw_tanggal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          safeNo,
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

    // ─── PUT (Update Temuan) ──────────────────────────────────────────────
    if (req.method === 'PUT') {
      const item = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const id = req.query?.id || item?.id;
      if (!id) {
        return res.status(400).json({ error: 'ID temuan diperlukan' });
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

    // ─── DELETE (Hapus Temuan) ────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const item = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      const id = req.query?.id || item?.id;
      if (!id) {
        return res.status(400).json({ error: 'ID temuan diperlukan' });
      }

      await db.execute({
        sql: 'DELETE FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
        args: [id, id],
      });

      return res.status(200).json({ success: true, message: 'Temuan berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err: any) {
    console.error('API /api/findings error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
