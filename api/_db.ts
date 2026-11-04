import { createClient, type Client } from '@libsql/client/web';
import seedData from '../src/data/seed.json';
import type { K3Finding } from '../src/types/k3';

let client: Client | null = null;

const DEFAULT_URL = 'libsql://dashboard-fahri233.aws-ap-southeast-1.turso.io';
const DEFAULT_AUTH_TOKEN =
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM3MTY3MTcsImlkIjoiMDFhMWExZDgtZTIwMS03NzE5LWJkMDUtOTIxNDVhMzczN2EwIiwia2lkIjoiUml3czV4QW40aWV5eWVlYWpwV19uSnJfbXBoRklyb3N5eWE2YmJnZERtMCIsInJpZCI6Ijc4ODI4YjQyLWIxNzAtNDI4YS1hMDQ4LTVhNzc3NWE3MDBmOSJ9.oGGutSDRGFKwD9l7G2V2e2uaRFkCtM1IOHq574vfGyIa8zoua9ucgFFcwEiECIc6EGcg0p893hqrTxbZwbo4Ag';

export function getTursoClient(): Client {
  const url = process.env.TURSO_DATABASE_URL || DEFAULT_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || DEFAULT_AUTH_TOKEN;

  if (!client) {
    client = createClient({
      url,
      authToken: authToken || undefined,
    });
  }

  return client;
}

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

export async function initDatabase(db: Client) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      no INTEGER NOT NULL UNIQUE,
      tanggal TEXT NOT NULL,
      tanggal_iso TEXT NOT NULL,
      lokasi TEXT NOT NULL,
      aktivitas TEXT NOT NULL,
      potensi_bahaya TEXT NOT NULL,
      kategori TEXT NOT NULL,
      tingkat_risiko TEXT NOT NULL,
      pengendalian TEXT NOT NULL,
      status TEXT NOT NULL,
      keterangan TEXT NOT NULL DEFAULT '-',
      raw_kategori TEXT,
      raw_pengendalian TEXT,
      raw_potensi_bahaya TEXT,
      raw_tanggal TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const countResult = await db.execute('SELECT COUNT(*) as count FROM findings');
  const count = Number(countResult.rows[0].count);

  if (count === 0) {
    await seedFindings(db);
  }
}

export async function seedFindings(db: Client) {
  await db.execute('DELETE FROM findings');

  const statements = (seedData as K3Finding[]).map(item => ({
    sql: `
      INSERT INTO findings (
        id, no, tanggal, tanggal_iso, lokasi, aktivitas, potensi_bahaya,
        kategori, tingkat_risiko, pengendalian, status, keterangan,
        raw_kategori, raw_pengendalian, raw_potensi_bahaya, raw_tanggal
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `,
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

  await db.batch(statements, 'write');
}
