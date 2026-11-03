import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawRow {
  No?: any;
  Tanggal?: any;
  Lokasi?: any;
  Aktivitas?: any;
  'Potensi Bahaya'?: any;
  Kategori?: any;
  'Tingkat Risiko'?: any;
  Pengendalian?: any;
  Status?: any;
  Keterangan?: any;
}

function parseExcelDate(serialOrStr: any): { ddMmYyyy: string; iso: string } {
  if (typeof serialOrStr === 'number') {
    // Excel base date 1899-12-30
    const date = new Date(Math.round((serialOrStr - 25569) * 86400 * 1000));
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return {
      ddMmYyyy: `${day}/${month}/${year}`,
      iso: `${year}-${month}-${day}`
    };
  }

  const str = String(serialOrStr || '').trim();
  const parts = str.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return {
        ddMmYyyy: `${parts[0]}/${parts[1]}/${parts[2]}`,
        iso: `${parts[2]}-${parts[1]}-${parts[0]}`
      };
    } else if (parts[0].length === 4) {
      return {
        ddMmYyyy: `${parts[2]}/${parts[1]}/${parts[0]}`,
        iso: `${parts[0]}-${parts[1]}-${parts[2]}`
      };
    }
  }

  return { ddMmYyyy: str, iso: str };
}

function runImport() {
  const excelPath = path.resolve(__dirname, '../DASHBOARD.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error(`File Excel tidak ditemukan di: ${excelPath}`);
    process.exit(1);
  }

  console.log(`Membaca file Excel dari: ${excelPath}...`);
  const fileBuffer = fs.readFileSync(excelPath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const databaseSheet = workbook.Sheets['Database'];
  if (!databaseSheet) {
    console.error("Sheet 'Database' tidak ditemukan!");
    process.exit(1);
  }

  // Parse as JSON array of objects
  const rawRows: RawRow[] = XLSX.utils.sheet_to_json(databaseSheet, {
    range: 'A1:J26',
    defval: ''
  });

  const validFindings: any[] = [];

  for (const row of rawRows) {
    // Ignore rows where No or Tanggal is empty
    if (!row.No || row.No === '' || isNaN(Number(row.No))) {
      continue;
    }

    const no = Number(row.No);
    const rawTanggal = row.Tanggal;
    const { ddMmYyyy, iso } = parseExcelDate(rawTanggal);

    const rawLokasi = String(row.Lokasi || '');
    const rawAktivitas = String(row.Aktivitas || '');
    const rawPotensiBahaya = String(row['Potensi Bahaya'] || '');
    const rawKategori = String(row.Kategori || '');
    const rawTingkatRisiko = String(row['Tingkat Risiko'] || '');
    const rawPengendalian = String(row.Pengendalian || '');
    const rawStatus = String(row.Status || '');
    const rawKeterangan = String(row.Keterangan || '');

    // Trim strings
    const lokasi = rawLokasi.trim();
    const aktivitas = rawAktivitas.trim();
    const potensiBahaya = rawPotensiBahaya.trim();
    let kategori = rawKategori.trim();
    const tingkatRisiko = rawTingkatRisiko.trim();
    const pengendalian = rawPengendalian.trim();
    const status = rawStatus.trim();
    const keterangan = rawKeterangan.trim() || '-';

    // Normalisasi kategori: "Egronomi" -> "Ergonomi"
    if (kategori === 'Egronomi') {
      kategori = 'Ergonomi';
    }

    validFindings.push({
      id: `K3-${no}`,
      no,
      tanggal: ddMmYyyy,
      tanggalIso: iso,
      lokasi,
      aktivitas,
      potensiBahaya,
      kategori,
      tingkatRisiko,
      pengendalian,
      status,
      keterangan,
      raw: {
        kategori: rawKategori,
        pengendalian: rawPengendalian,
        potensiBahaya: rawPotensiBahaya,
        tanggal: ddMmYyyy
      }
    });
  }

  console.log(`Berhasil memproses ${validFindings.length} baris valid dari Excel.`);

  const outDir = path.resolve(__dirname, '../src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'seed.json');
  fs.writeFileSync(outPath, JSON.stringify(validFindings, null, 2), 'utf-8');
  console.log(`Data seed tersimpan di: ${outPath}`);
}

runImport();
