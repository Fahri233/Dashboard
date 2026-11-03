# K3 Safety Monitoring (Occupational Safety Risk Dashboard)

Aplikasi web modern berbasis React, TypeScript, dan Tailwind CSS untuk pemantauan, analisis risiko, serta manajemen database K3 (Keselamatan dan Kesehatan Kerja). Aplikasi ini merupakan hasil digitalisasi dan pembenahan dari file spreadsheet `DASHBOARD.xlsx`.

---

## 🚀 Fitur Utama

1. **Dashboard Interaktif (Halaman 1):**
   - **4 Kartu KPI:** Total Temuan (22), Risiko Tinggi (8), Risiko Sedang (10), dan Risiko Rendah (4).
   - **Filter Slicer Multi-Select (Chip):** Filter simultan untuk Lokasi, Kategori, Tingkat Risiko, dan Status, dilengkapi pencarian rentang tanggal.
   - **4 Visualisasi Recharts Dinamis:**
     1. *Potensi Bahaya Berdasarkan Kategori:* Bar chart vertikal dengan label angka di atas batang untuk 5 kategori (termasuk Kimia = 0).
     2. *Tingkat Risiko:* Donut chart proporsi risiko dengan label persentase dan warna standar K3 (Merah, Kuning, Hijau).
     3. *Tren Temuan K3 per Bulan:* Line chart tren bulanan yang telah diperbaiki dari versi Excel (dilengkapi opsi toggle *Tampilkan bulan kosong*).
     4. *Status Tindak Lanjut:* Horizontal bar chart status Belum, Proses, dan Selesai.
     *(Klik batang/irisan grafik langsung mengaktifkan filter terkait).*
   - **Panel Perlu Perhatian:** Notifikasi khusus temuan risiko Tinggi yang belum selesai, diurutkan dari temuan terlama.
   - **Tabel Temuan Terbaru:** 10 temuan terakhir tanpa baris kosong `(blank)`, diurutkan dari tanggal terbaru.
   - **Cetak / Simpan PDF:** Styling `@media print` rapi untuk kebutuhan pelaporan fisik atau export PDF satu klik.

2. **Pengolahan Data Analitik (Halaman 2):**
   - **Ringkasan Data:** Metrik rekapitulasi Total Temuan, Tingkat Risiko, dan Status.
   - **Rekap Berdasarkan Kategori:** Tabel persentase 5 kategori terhitung terhadap total temuan (setelah perbaikan typo "Egronomi").
   - **Rekap Tingkat Risiko:** Tabel persentase risiko Tinggi, Sedang, dan Rendah.
   - **Analisis Kombinasi:** 4 metrik kombinasi (Biologis + Tinggi, Ergonomi + Sedang, Ruang Pelayanan + Proses, Area Tunggu + Tinggi).
   - **Crosstab (Tabel Silang) dengan Heatmap:**
     - Matriks Kategori × Tingkat Risiko
     - Matriks Lokasi × Status
   - Seluruh metrik terhubung reaktif dengan filter global.

3. **Database & Manajemen CRUD (Halaman 3):**
   - **Tabel Penuh 10 Kolom:** `No`, `Tanggal`, `Lokasi`, `Aktivitas`, `Potensi Bahaya`, `Kategori`, `Tingkat Risiko`, `Pengendalian`, `Status`, `Keterangan`.
   - **Fitur Interaktif:** Pencarian teks bebas, pengurutan per kolom (sorting asc/desc), filter kolom, dan paginasi (10, 25, 50 baris).
   - **Form Tambah & Edit Temuan:** Penomoran otomatis berurutan, datepicker, 4 dropdown terkunci sesuai daftar valid, serta peringatan ramah (*non-blocking*) jika memilih tanggal di masa depan.
   - **Hapus Data:** Konfirmasi dialog yang aman sebelum penghapusan.
   - **Import & Export:**
     - Import file `.xlsx` (dukungan mode replace atau append).
     - Export Excel (`.xlsx`) berformat rapi dengan header tebal dan lebar kolom disesuaikan.
     - Export CSV (ber-BOM UTF-8 agar kompatibel langsung dengan Microsoft Excel).
     - Tombol *Reset ke Data Excel* untuk memulihkan data bawaan kapan saja.

4. **Kualitas Data & Audit Anomali (Halaman 4):**
   - Audit otomatis integritas data mentah (`raw`):
     - Normalisasi typo `"Egronomi"` menjadi `"Ergonomi"` (No 1, 9, 12).
     - Deteksi tanggal di masa depan (No 22: `02/11/2027`).
     - Deteksi dan pembersihan spasi berlebih (*trailing whitespace* pada No 21: `"pengaturan "`).
     - Heuristik potensi ketidaksesuaian kategori (No 22: "Kepleset" dikategorikan Biologis).
     - Deteksi inkonsistensi penulisan kapitalisasi & ejaan bahasa asing (No 21: `"stress"` vs `"Stres akibat pekerjaan"`).
   - Tombol **"Perbaiki"** pada setiap baris anomali yang langsung membuka form edit temuan terkait.

5. **Dukungan Tema:**
   - **Mode Terang** (default palet hijau-abu Excel: `#354F52`, `#6B8E6B`, `#EAF0EC`, `#F7F9F5`).
   - **Mode Gelap** (desain kontras tinggi yang nyaman di mata).

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/)
- **Visualisasi Data:** [Recharts](https://recharts.org/)
- **Excel & CSV Handler:** [SheetJS (xlsx)](https://sheetjs.com/)
- **Ikon Antarmuka:** [Lucide React](https://lucide.dev/)
- **Pengujian Unit:** [Vitest](https://vitest.dev/)
- **Penyimpanan:** Browser `localStorage` (tanpa server backend terpisah)

---

## 📁 Struktur Direktori

```
D:\dashboard\
├── scripts/
│   └── import-excel.ts          # Script membaca DASHBOARD.xlsx -> menghasilkan seed.json
├── src/
│   ├── assets/                  # Asset gambar & ikon
│   ├── components/
│   │   ├── common/              # Komponen UI umum (Header, Sidebar, Modal, Badge, Button)
│   │   ├── dashboard/           # Komponen halaman Dashboard (KPI, Filter, 4 Recharts, Temuan Terbaru, Attention Panel)
│   │   ├── database/            # Komponen halaman Database (DataTable, FindingFormModal, DeleteConfirmModal)
│   │   ├── kualitas/            # Komponen halaman Kualitas Data (QualityAnomalyTable)
│   │   └── pengolahan/          # Komponen halaman Pengolahan (Ringkasan, Rekap, Kombinasi, Crosstab Heatmap)
│   ├── context/
│   │   ├── FilterContext.tsx     # State filter global (slicer)
│   │   ├── K3DataContext.tsx     # State data utama (CRUD, localStorage, seed, import/export)
│   │   └── ThemeContext.tsx      # State tema (Dark/Light Mode)
│   ├── data/
│   │   └── seed.json            # Data seed terstruktur hasil import dari DASHBOARD.xlsx
│   ├── lib/
│   │   ├── data-quality.ts      # Logika deteksi anomali kualitas data otomatis
│   │   ├── excel-export.ts      # Utility SheetJS untuk import/export Excel & CSV
│   │   ├── k3-calculations.ts   # Fungsi kalkulasi analitik murni
│   │   └── k3-calculations.test.ts # Unit test verifikasi Angka Acuan
│   ├── pages/
│   │   ├── DashboardPage.tsx    # Halaman 1: Dashboard Utama
│   │   ├── DatabasePage.tsx     # Halaman 3: Database (CRUD)
│   │   ├── KualitasDataPage.tsx # Halaman 4: Audit Kualitas Data
│   │   └── PengolahanPage.tsx   # Halaman 2: Pengolahan & Crosstab
│   ├── types/
│   │   └── k3.ts                # Deklarasi tipe TypeScript K3
│   ├── App.tsx                  # Root Application & Layout Shell
│   ├── index.css                # Tailwind directives & CSS Print styling
│   ├── main.tsx                 # Entry point React DOM
│   └── vite-env.d.ts            # Deklarasi lingkungan Vite
├── DASHBOARD.xlsx               # File sumber Excel asli
├── index.html                   # HTML template aplikasi
├── package.json                 # Konfigurasi dependensi dan script npm
├── postcss.config.js            # Konfigurasi PostCSS
├── tailwind.config.js           # Konfigurasi warna & utility Tailwind
├── tsconfig.json                # Konfigurasi TypeScript compiler
└── vite.config.ts               # Konfigurasi build Vite
```

---

## 💻 Cara Instalasi & Menjalankan

### Prasyarat
- **Node.js** (versi 18 ke atas disarankan; telah diuji pada Node.js v26 LTS)
- **npm** (versi 9 ke atas)

### 1. Instalasi Dependensi
Jalankan perintah berikut di folder proyek:
```bash
npm install
```

### 2. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka browser di alamat: `http://localhost:3000` (atau port yang ditampilkan di terminal).

### 3. Menjalankan Pengujian Unit (Unit Test)
Untuk memverifikasi seluruh kalkulasi analitik terhadap checklist Angka Acuan:
```bash
npm test
```

### 4. Membangun Versi Produksi (Production Build)
```bash
npm run build
npm run preview
```

---

## 🔄 Cara Memperbarui Data dari File Excel

Jika file `DASHBOARD.xlsx` di root folder mengalami perubahan data atau Anda menggantinya dengan file Excel baru yang memiliki struktur tabel yang sama:

1. Letakkan file `DASHBOARD.xlsx` di root folder proyek (`D:\dashboard\DASHBOARD.xlsx`).
2. Jalankan script import otomatis:
   ```bash
   npm run import
   ```
   Script akan:
   - Membaca sheet `Database` pada rentang tabel `tblK3`.
   - Mengabaikan baris kosong (baris 24–26).
   - Melakukan trimming spasi pada setiap teks.
   - Menormalisasi typo `"Egronomi"` menjadi `"Ergonomi"`.
   - Menyimpan nilai asli (*raw*) untuk keperluan audit kualitas data.
   - Memperbarui file `src/data/seed.json`.
3. Di antarmuka aplikasi web, klik tombol **"Reset ke Data Excel"** pada header banner untuk menyinkronkan data baru ke `localStorage` peramban Anda.

---

## 📊 Checklist Verifikasi Angka Acuan

Seluruh angka di bawah ini telah terverifikasi cocok 100% melalui unit test `src/lib/k3-calculations.test.ts` dan antarmuka aplikasi:

- **Total Temuan:** `22`
- **Tingkat Risiko:** Tinggi `8`, Sedang `10`, Rendah `4`
- **Status Tindak Lanjut:** Selesai `11`, Proses `9`, Belum `2`
- **Lokasi Temuan:** Meja Pendaftaran `10`, Ruang Pelayanan `7`, Area Tunggu `5`
- **Rekap Kategori (setelah normalisasi):**
  - Ergonomi: `4` (18,2%)
  - Biologis: `7` (31,8%)
  - Fisik: `5` (22,7%)
  - Psikososial: `6` (27,3%)
  - Kimia: `0` (0,0%)
  - Total: `22` (100%)
- **Analisis Kombinasi:**
  - Biologis + Risiko Tinggi: `7`
  - Ergonomi + Risiko Sedang: `3` (di Excel asli tercatat 1 karena typo Egronomi)
  - Ruang Pelayanan + Proses: `5`
  - Area Tunggu + Risiko Tinggi: `1`
- **Tren Temuan per Bulan:**
  - Jan 2025: `12`
  - Feb 2025: `6`
  - Mar 2025: `2`
  - Nov 2026: `1`
  - Nov 2027: `1`
- **Temuan Terbaru (Urut Teratas):**
  1. No 22 (`02/11/2027`)
  2. No 21 (`02/11/2026`)
  3. No 20 (`10/03/2025`)
- **Uji Filter Ruang Pelayanan:** Total `7`, Selesai `1`, Proses `5`, Belum `1`
- **Uji Filter Risiko Tinggi:** Total `8`, Selesai `1`, Proses `5`, Belum `2`
- **Panel Kualitas Data:** Mendeteksi 3 normalisasi "Egronomi", 1 tanggal masa depan (No 22), 1 kemungkinan salah kategori (No 22: Kepleset di Biologis), dan 1 spasi berlebih (No 21: "pengaturan ").

