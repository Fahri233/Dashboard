import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Read .env.local manually if not in process.env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...values] = trimmed.split('=');
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim();
    }
  }
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('Connecting to Turso:', url);

const db = createClient({
  url: url!,
  authToken: authToken!
});

async function main() {
  console.log('Creating table findings if not exists...');
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

  const seedPath = path.resolve(process.cwd(), 'src/data/seed.json');
  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  console.log(`Clearing existing findings and seeding ${seedData.length} records...`);
  await db.execute('DELETE FROM findings');

  const statements = seedData.map((item: any) => ({
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
      item.raw?.tanggal || null
    ]
  }));

  await db.batch(statements, 'write');

  const countResult = await db.execute('SELECT COUNT(*) as count FROM findings');
  console.log('Successfully seeded! Current row count in Turso:', countResult.rows[0].count);
}

main().catch(err => {
  console.error('Error during Turso seed:', err);
  process.exit(1);
});
