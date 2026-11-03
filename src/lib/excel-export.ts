import * as XLSX from 'xlsx';
import { K3Finding, KategoriType, LokasiType, StatusType, TingkatRisikoType } from '../types/k3';

export function exportToExcel(findings: K3Finding[], filename: string = 'K3_Safety_Monitoring_Export.xlsx') {
  const headers = [
    'No',
    'Tanggal',
    'Lokasi',
    'Aktivitas',
    'Potensi Bahaya',
    'Kategori',
    'Tingkat Risiko',
    'Pengendalian',
    'Status',
    'Keterangan'
  ];

  const rows = findings.map(f => [
    f.no,
    f.tanggal,
    f.lokasi,
    f.aktivitas,
    f.potensiBahaya,
    f.kategori,
    f.tingkatRisiko,
    f.pengendalian,
    f.status,
    f.keterangan
  ]);

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // Tanggal
    { wch: 20 }, // Lokasi
    { wch: 24 }, // Aktivitas
    { wch: 30 }, // Potensi Bahaya
    { wch: 16 }, // Kategori
    { wch: 16 }, // Tingkat Risiko
    { wch: 32 }, // Pengendalian
    { wch: 14 }, // Status
    { wch: 30 }  // Keterangan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Database');

  XLSX.writeFile(wb, filename);
}

export function exportToCSV(findings: K3Finding[], filename: string = 'K3_Safety_Monitoring_Export.csv') {
  const headers = [
    'No',
    'Tanggal',
    'Lokasi',
    'Aktivitas',
    'Potensi Bahaya',
    'Kategori',
    'Tingkat Risiko',
    'Pengendalian',
    'Status',
    'Keterangan'
  ];

  const escapeCSV = (val: any) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escapeCSV).join(','),
    ...findings.map(f => [
      f.no,
      f.tanggal,
      f.lokasi,
      f.aktivitas,
      f.potensiBahaya,
      f.kategori,
      f.tingkatRisiko,
      f.pengendalian,
      f.status,
      f.keterangan
    ].map(escapeCSV).join(','))
  ];

  // UTF-8 BOM so Excel opens CSV properly without garbled characters
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseExcelDate(serialOrStr: any): { ddMmYyyy: string; iso: string } {
  if (typeof serialOrStr === 'number') {
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

export async function parseUploadedExcel(file: File): Promise<K3Finding[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Use 'Database' sheet if exists, otherwise first sheet
  const sheetName = workbook.Sheets['Database'] ? 'Database' : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const importedFindings: K3Finding[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    // Find column matching No or number
    const noVal = row['No'] !== undefined ? row['No'] : row['no'];
    if (noVal === '' || isNaN(Number(noVal))) {
      continue;
    }

    const no = Number(noVal);
    const rawTanggal = row['Tanggal'] !== undefined ? row['Tanggal'] : row['tanggal'];
    const { ddMmYyyy, iso } = parseExcelDate(rawTanggal);

    const rawLokasi = String(row['Lokasi'] ?? row['lokasi'] ?? '');
    const rawAktivitas = String(row['Aktivitas'] ?? row['aktivitas'] ?? '');
    const rawPotensiBahaya = String(row['Potensi Bahaya'] ?? row['potensiBahaya'] ?? '');
    const rawKategori = String(row['Kategori'] ?? row['kategori'] ?? '');
    const rawTingkatRisiko = String(row['Tingkat Risiko'] ?? row['tingkatRisiko'] ?? '');
    const rawPengendalian = String(row['Pengendalian'] ?? row['pengendalian'] ?? '');
    const rawStatus = String(row['Status'] ?? row['status'] ?? '');
    const rawKeterangan = String(row['Keterangan'] ?? row['keterangan'] ?? '');

    const lokasi = rawLokasi.trim() as LokasiType;
    const aktivitas = rawAktivitas.trim();
    const potensiBahaya = rawPotensiBahaya.trim();
    let kategori = rawKategori.trim();
    const tingkatRisiko = rawTingkatRisiko.trim() as TingkatRisikoType;
    const pengendalian = rawPengendalian.trim();
    const status = rawStatus.trim() as StatusType;
    const keterangan = rawKeterangan.trim() || '-';

    if (kategori === 'Egronomi') {
      kategori = 'Ergonomi';
    }

    importedFindings.push({
      id: `K3-${no}-${Date.now()}-${i}`,
      no,
      tanggal: ddMmYyyy,
      tanggalIso: iso,
      lokasi,
      aktivitas,
      potensiBahaya,
      kategori: kategori as KategoriType,
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

  return importedFindings;
}
