import { createClient } from '@libsql/client/web';
import { K3Finding } from '../types/k3';
import seedData from '../data/seed.json';

const TURSO_URL = 'libsql://dashboard-fahri233.aws-ap-southeast-1.turso.io';
const TURSO_TOKEN =
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM3MTY3MTcsImlkIjoiMDFhMWExZDgtZTIwMS03NzE5LWJkMDUtOTIxNDVhMzczN2EwIiwia2lkIjoiUml3czV4QW40aWV5eWVlYWpwV19uSnJfbXBoRklyb3N5eWE2YmJnZERtMCIsInJpZCI6Ijc4ODI4YjQyLWIxNzAtNDI4YS1hMDQ4LTVhNzc3NWE3MDBmOSJ9.oGGutSDRGFKwD9l7G2V2e2uaRFkCtM1IOHq574vfGyIa8zoua9ucgFFcwEiECIc6EGcg0p893hqrTxbZwbo4Ag';

export const directTursoDb = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

export function rowToFinding(row: any): K3Finding {
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

export async function directFetchAllFindings(): Promise<K3Finding[]> {
  const result = await directTursoDb.execute('SELECT * FROM findings ORDER BY no ASC');
  return result.rows.map(rowToFinding);
}

export async function directInsertFinding(item: K3Finding): Promise<K3Finding> {
  const maxRes = await directTursoDb.execute('SELECT MAX(no) as max_no FROM findings');
  const maxNo = Number(maxRes.rows[0]?.max_no || 0);
  const safeNo = item.no && item.no > maxNo ? item.no : maxNo + 1;
  const id = item.id || `K3-${safeNo}-${Date.now()}`;

  await directTursoDb.execute({
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

  return { ...item, id, no: safeNo };
}

export async function directUpdateFinding(item: K3Finding): Promise<K3Finding> {
  await directTursoDb.execute({
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
      item.id,
      item.id,
    ],
  });
  return item;
}

export async function directDeleteFinding(id: string): Promise<void> {
  await directTursoDb.execute({
    sql: 'DELETE FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
    args: [id, id],
  });
}

export async function directResetSeed(): Promise<void> {
  await directTursoDb.execute('DELETE FROM findings');
  const statements = (seedData as K3Finding[]).map(item => ({
    sql: `INSERT INTO findings (
      id, no, tanggal, tanggal_iso, lokasi, aktivitas, potensi_bahaya,
      kategori, tingkat_risiko, pengendalian, status, keterangan,
      raw_kategori, raw_pengendalian, raw_potensi_bahaya, raw_tanggal
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      item.id,
      item.no,
      item.tanggal,
      item.tanggalIso,
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
  }));
  await directTursoDb.batch(statements, 'write');
}

