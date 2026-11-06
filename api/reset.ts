import { createClient } from '@libsql/client/http';

const TURSO_URL =
  process.env.TURSO_DATABASE_URL ||
  'libsql://dashboard-fahri233.aws-ap-southeast-1.turso.io';
const TURSO_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM3MTY3MTcsImlkIjoiMDFhMWExZDgtZTIwMS03NzE5LWJkMDUtOTIxNDVhMzczN2EwIiwia2lkIjoiUml3czV4QW40aWV5eWVlYWpwV19uSnJfbXBoRklyb3N5eWE2YmJnZERtMCIsInJpZCI6Ijc4ODI4YjQyLWIxNzAtNDI4YS1hMDQ4LTVhNzc3NWE3MDBmOSJ9.oGGutSDRGFKwD9l7G2V2e2uaRFkCtM1IOHq574vfGyIa8zoua9ucgFFcwEiECIc6EGcg0p893hqrTxbZwbo4Ag';

const SEED_FINDINGS = [
  {
    id: "K3-1",
    no: 1,
    tanggal: "02/01/2025",
    tanggalIso: "2025-01-02",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Pendaftaran pasien",
    potensiBahaya: "Postur duduk tidak ergonomis",
    kategori: "Ergonomi",
    tingkatRisiko: "Sedang",
    pengendalian: "Atur posisi kursi dan monitor",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Egronomi",
      pengendalian: "Atur posisi kursi dan monitor",
      potensiBahaya: "Postur duduk tidak ergonomis",
      tanggal: "02/01/2025"
    }
  },
  {
    id: "K3-2",
    no: 2,
    tanggal: "03/01/2025",
    tanggalIso: "2025-01-03",
    lokasi: "Ruang Pelayanan",
    aktivitas: "Pelayanan pasien",
    potensiBahaya: "Kontak dengan pasien",
    kategori: "Biologis",
    tingkatRisiko: "Tinggi",
    pengendalian: "Penggunaan APD",
    status: "Proses",
    keterangan: "Pemantauan penggunaan APD",
    raw: {
      kategori: "Biologis",
      pengendalian: "Penggunaan APD",
      potensiBahaya: "Kontak dengan pasien",
      tanggal: "03/01/2025"
    }
  },
  {
    id: "K3-3",
    no: 3,
    tanggal: "06/01/2025",
    tanggalIso: "2025-01-06",
    lokasi: "Area Tunggu",
    aktivitas: "Antrean pasien",
    potensiBahaya: "Kepadatan pasien",
    kategori: "Psikososial",
    tingkatRisiko: "Sedang",
    pengendalian: "Pengaturan antrean",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Psikososial",
      pengendalian: "Pengaturan antrean",
      potensiBahaya: "Kepadatan pasien",
      tanggal: "06/01/2025"
    }
  },
  {
    id: "K3-4",
    no: 4,
    tanggal: "08/01/2025",
    tanggalIso: "2025-01-08",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Input data",
    potensiBahaya: "Kabel berserakan",
    kategori: "Fisik",
    tingkatRisiko: "Rendah",
    pengendalian: "Rapikan kabel",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Fisik",
      pengendalian: "Rapikan kabel",
      potensiBahaya: "Kabel berserakan",
      tanggal: "08/01/2025"
    }
  },
  {
    id: "K3-5",
    no: 5,
    tanggal: "10/01/2025",
    tanggalIso: "2025-01-10",
    lokasi: "Ruang Pelayanan",
    aktivitas: "Pelayanan pasien",
    potensiBahaya: "Paparan penyakit",
    kategori: "Biologis",
    tingkatRisiko: "Tinggi",
    pengendalian: "Penggunaan APD",
    status: "Proses",
    keterangan: "Pengawasan rutin",
    raw: {
      kategori: "Biologis",
      pengendalian: "Penggunaan APD",
      potensiBahaya: "Paparan penyakit",
      tanggal: "10/01/2025"
    }
  },
  {
    id: "K3-6",
    no: 6,
    tanggal: "12/01/2025",
    tanggalIso: "2025-01-12",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Pendaftaran pasien",
    potensiBahaya: "Beban kerja berlebih",
    kategori: "Psikososial",
    tingkatRisiko: "Sedang",
    pengendalian: "Rotasi petugas",
    status: "Proses",
    keterangan: "Evaluasi beban kerja",
    raw: {
      kategori: "Psikososial",
      pengendalian: "Rotasi petugas",
      potensiBahaya: "Beban kerja berlebih",
      tanggal: "12/01/2025"
    }
  },
  {
    id: "K3-7",
    no: 7,
    tanggal: "15/01/2025",
    tanggalIso: "2025-01-15",
    lokasi: "Area Tunggu",
    aktivitas: "Antrean pasien",
    potensiBahaya: "Lantai licin",
    kategori: "Fisik",
    tingkatRisiko: "Rendah",
    pengendalian: "Peringatan lantai",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Fisik",
      pengendalian: "Peringatan lantai",
      potensiBahaya: "Lantai licin",
      tanggal: "15/01/2025"
    }
  },
  {
    id: "K3-8",
    no: 8,
    tanggal: "17/01/2025",
    tanggalIso: "2025-01-17",
    lokasi: "Ruang Pelayanan",
    aktivitas: "Pelayanan pasien",
    potensiBahaya: "Alat medis terkontaminasi",
    kategori: "Biologis",
    tingkatRisiko: "Tinggi",
    pengendalian: "Perawatan alat",
    status: "Proses",
    keterangan: "Sterilisasi berkala",
    raw: {
      kategori: "Biologis",
      pengendalian: "Perawatan alat",
      potensiBahaya: "Alat medis terkontaminasi",
      tanggal: "17/01/2025"
    }
  },
  {
    id: "K3-9",
    no: 9,
    tanggal: "20/01/2025",
    tanggalIso: "2025-01-20",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Input data",
    potensiBahaya: "Nyeri pergelangan tangan",
    kategori: "Ergonomi",
    tingkatRisiko: "Sedang",
    pengendalian: "Keyboard ergonomis",
    status: "Proses",
    keterangan: "-",
    raw: {
      kategori: "Egronomi",
      pengendalian: "Keyboard ergonomis",
      potensiBahaya: "Nyeri pergelangan tangan",
      tanggal: "20/01/2025"
    }
  },
  {
    id: "K3-10",
    no: 10,
    tanggal: "22/01/2025",
    tanggalIso: "2025-01-22",
    lokasi: "Ruang Pelayanan",
    aktivitas: "Pelayanan pasien",
    potensiBahaya: "Infeksi udara",
    kategori: "Biologis",
    tingkatRisiko: "Tinggi",
    pengendalian: "Ventilasi dan APD",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Biologis",
      pengendalian: "Ventilasi dan APD",
      potensiBahaya: "Infeksi udara",
      tanggal: "22/01/2025"
    }
  },
  {
    id: "K3-11",
    no: 11,
    tanggal: "25/01/2025",
    tanggalIso: "2025-01-25",
    lokasi: "Area Tunggu",
    aktivitas: "Antrean pasien",
    potensiBahaya: "Suara bising",
    kategori: "Fisik",
    tingkatRisiko: "Sedang",
    pengendalian: "Pengaturan area tunggu",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Fisik",
      pengendalian: "Pengaturan area tunggu",
      potensiBahaya: "Suara bising",
      tanggal: "25/01/2025"
    }
  },
  {
    id: "K3-12",
    no: 12,
    tanggal: "28/01/2025",
    tanggalIso: "2025-01-28",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Pendaftaran pasien",
    potensiBahaya: "Posisi monitor terlalu rendah",
    kategori: "Ergonomi",
    tingkatRisiko: "Rendah",
    pengendalian: "Atur ketinggian monitor",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Egronomi",
      pengendalian: "Atur ketinggian monitor",
      potensiBahaya: "Posisi monitor terlalu rendah",
      tanggal: "28/01/2025"
    }
  },
  {
    id: "K3-13",
    no: 13,
    tanggal: "03/02/2025",
    tanggalIso: "2025-02-03",
    lokasi: "Ruang Pelayanan",
    aktivitas: "Pelayanan pasien",
    potensiBahaya: "Kontak cairan tubuh",
    kategori: "Biologis",
    tingkatRisiko: "Tinggi",
    pengendalian: "Penggunaan sarung tangan",
    status: "Proses",
    keterangan: "-",
    raw: {
      kategori: "Biologis",
      pengendalian: "Penggunaan sarung tangan",
      potensiBahaya: "Kontak cairan tubuh",
      tanggal: "03/02/2025"
    }
  },
  {
    id: "K3-14",
    no: 14,
    tanggal: "07/02/2025",
    tanggalIso: "2025-02-07",
    lokasi: "Area Tunggu",
    aktivitas: "Antrean pasien",
    potensiBahaya: "Antrean terlalu panjang",
    kategori: "Psikososial",
    tingkatRisiko: "Sedang",
    pengendalian: "Penambahan petugas",
    status: "Proses",
    keterangan: "-",
    raw: {
      kategori: "Psikososial",
      pengendalian: "Penambahan petugas",
      potensiBahaya: "Antrean terlalu panjang",
      tanggal: "07/02/2025"
    }
  },
  {
    id: "K3-15",
    no: 15,
    tanggal: "11/02/2025",
    tanggalIso: "2025-02-11",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Input data",
    potensiBahaya: "Pencahayaan kurang",
    kategori: "Fisik",
    tingkatRisiko: "Rendah",
    pengendalian: "Perbaikan pencahayaan",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Fisik",
      pengendalian: "Perbaikan pencahayaan",
      potensiBahaya: "Pencahayaan kurang",
      tanggal: "11/02/2025"
    }
  },
  {
    id: "K3-16",
    no: 16,
    tanggal: "15/02/2025",
    tanggalIso: "2025-02-15",
    lokasi: "Ruang Pelayanan",
    aktivitas: "Pelayanan pasien",
    potensiBahaya: "Beban kerja tinggi",
    kategori: "Psikososial",
    tingkatRisiko: "Tinggi",
    pengendalian: "Pembagian tugas",
    status: "Belum",
    keterangan: "Diperlukan evaluasi",
    raw: {
      kategori: "Psikososial",
      pengendalian: "Pembagian tugas",
      potensiBahaya: "Beban kerja tinggi",
      tanggal: "15/02/2025"
    }
  },
  {
    id: "K3-17",
    no: 17,
    tanggal: "20/02/2025",
    tanggalIso: "2025-02-20",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Pendaftaran pasien",
    potensiBahaya: "Gerakan berulang",
    kategori: "Ergonomi",
    tingkatRisiko: "Sedang",
    pengendalian: "Istirahat berkala",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Ergonomi",
      pengendalian: "Istirahat berkala",
      potensiBahaya: "Gerakan berulang",
      tanggal: "20/02/2025"
    }
  },
  {
    id: "K3-18",
    no: 18,
    tanggal: "24/02/2025",
    tanggalIso: "2025-02-24",
    lokasi: "Area Tunggu",
    aktivitas: "Antrean pasien",
    potensiBahaya: "Kerumunan pasien",
    kategori: "Biologis",
    tingkatRisiko: "Tinggi",
    pengendalian: "Pengaturan jarak",
    status: "Belum",
    keterangan: "Menunggu pemasangan pembatas",
    raw: {
      kategori: "Biologis",
      pengendalian: "Pengaturan jarak",
      potensiBahaya: "Kerumunan pasien",
      tanggal: "24/02/2025"
    }
  },
  {
    id: "K3-19",
    no: 19,
    tanggal: "05/03/2025",
    tanggalIso: "2025-03-05",
    lokasi: "Ruang Pelayanan",
    aktivitas: "Pelayanan pasien",
    potensiBahaya: "Lantai basah",
    kategori: "Fisik",
    tingkatRisiko: "Sedang",
    pengendalian: "Pembersihan segera",
    status: "Proses",
    keterangan: "-",
    raw: {
      kategori: "Fisik",
      pengendalian: "Pembersihan segera",
      potensiBahaya: "Lantai basah",
      tanggal: "05/03/2025"
    }
  },
  {
    id: "K3-20",
    no: 20,
    tanggal: "10/03/2025",
    tanggalIso: "2025-03-10",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Input data",
    potensiBahaya: "Stres akibat pekerjaan",
    kategori: "Psikososial",
    tingkatRisiko: "Sedang",
    pengendalian: "Pembagian beban kerja",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Psikososial",
      pengendalian: "Pembagian beban kerja",
      potensiBahaya: "Stres akibat pekerjaan",
      tanggal: "10/03/2025"
    }
  },
  {
    id: "K3-21",
    no: 21,
    tanggal: "02/11/2026",
    tanggalIso: "2026-11-02",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Pelayanan pasien",
    potensiBahaya: "stress",
    kategori: "Psikososial",
    tingkatRisiko: "Sedang",
    pengendalian: "pengaturan",
    status: "Selesai",
    keterangan: "-",
    raw: {
      kategori: "Psikososial",
      pengendalian: "pengaturan ",
      potensiBahaya: "stress",
      tanggal: "02/11/2026"
    }
  },
  {
    id: "K3-22",
    no: 22,
    tanggal: "02/11/2027",
    tanggalIso: "2027-11-02",
    lokasi: "Meja Pendaftaran",
    aktivitas: "Input data",
    potensiBahaya: "Kepleset",
    kategori: "Biologis",
    tingkatRisiko: "Tinggi",
    pengendalian: "Pel lantai",
    status: "Proses",
    keterangan: "-",
    raw: {
      kategori: "Biologis",
      pengendalian: "Pel lantai",
      potensiBahaya: "Kepleset",
      tanggal: "02/11/2027"
    }
  }
];

function getDb() {
  return createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan, gunakan POST' });
  }

  try {
    const db = getDb();

    // Pastikan tabel ada
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

    // 1. Hapus seluruh data temuan saat ini
    await db.execute('DELETE FROM findings');

    // 2. Batch insert 22 record master seed
    const statements = SEED_FINDINGS.map(item => ({
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

    await db.batch(statements, 'write');

    const countResult = await db.execute('SELECT COUNT(*) as count FROM findings');
    const count = Number(countResult.rows[0]?.count || 0);

    return res.status(200).json({
      success: true,
      message: `Database berhasil direset ke ${count} temuan awal Excel.`,
      count,
    });
  } catch (err: any) {
    console.error('API /api/reset error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error saat reset' });
  }
}
