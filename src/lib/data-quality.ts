import { K3Finding, QualityAnomaly, VALID_KATEGORI, VALID_LOKASI, VALID_STATUS, VALID_TINGKAT_RISIKO } from '../types/k3';

export function detectDataQualityAnomalies(findings: K3Finding[]): QualityAnomaly[] {
  const anomalies: QualityAnomaly[] = [];
  const now = new Date();
  const currentIso = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

  for (const f of findings) {
    // 1. Normalisasi kategori (Egronomi -> Ergonomi)
    if (f.raw?.kategori && f.raw.kategori.toLowerCase() === 'egronomi') {
      anomalies.push({
        id: `anom-norm-cat-${f.no}`,
        findingNo: f.no,
        type: 'normalization',
        field: 'Kategori',
        message: 'Kategori salah ketik "Egronomi" dinormalisasi menjadi "Ergonomi".',
        originalValue: f.raw.kategori,
        currentValue: f.kategori,
        severity: 'info'
      });
    }

    // 2. Tanggal di masa depan
    if (f.tanggalIso > currentIso) {
      anomalies.push({
        id: `anom-future-date-${f.no}`,
        findingNo: f.no,
        type: 'future_date',
        field: 'Tanggal',
        message: `Tanggal ${f.tanggal} berada di masa depan (kemungkinan salah input tahun).`,
        originalValue: f.raw?.tanggal || f.tanggal,
        currentValue: f.tanggal,
        severity: 'warning'
      });
    }

    // 3. Spasi berlebih / Trailing whitespace
    if (f.raw?.pengendalian && f.raw.pengendalian !== f.raw.pengendalian.trim()) {
      anomalies.push({
        id: `anom-whitespace-peng-${f.no}`,
        findingNo: f.no,
        type: 'whitespace',
        field: 'Pengendalian',
        message: `Teks Pengendalian memiliki spasi berlebih ("${f.raw.pengendalian}"). Spasi telah di-trim otomatis.`,
        originalValue: `"${f.raw.pengendalian}"`,
        currentValue: `"${f.pengendalian}"`,
        severity: 'info'
      });
    }

    // 4. Potensi salah kategori heuristik (Kepleset berkategori Biologis)
    const pbLower = f.potensiBahaya.toLowerCase();
    if ((pbLower.includes('kepleset') || pbLower.includes('licin') || pbLower.includes('jatuh')) && f.kategori === 'Biologis') {
      anomalies.push({
        id: `anom-wrong-cat-${f.no}`,
        findingNo: f.no,
        type: 'potential_wrong_category',
        field: 'Kategori',
        message: `Potensi bahaya "${f.potensiBahaya}" dikategorikan "${f.kategori}". Risiko fisik terpeleset umumnya berkategori "Fisik".`,
        originalValue: f.kategori,
        currentValue: f.kategori,
        severity: 'warning'
      });
    }

    // 5. Inkonsistensi ejaan / Casing
    if (pbLower === 'stress') {
      anomalies.push({
        id: `anom-spell-pb-${f.no}`,
        findingNo: f.no,
        type: 'spelling_inconsistency',
        field: 'Potensi Bahaya',
        message: 'Penggunaan kata "stress" (huruf kecil & ejaan bahasa asing). Standar baku bahasa Indonesia: "Stres".',
        originalValue: f.potensiBahaya,
        currentValue: f.potensiBahaya,
        severity: 'info'
      });
    }

    if (f.pengendalian && f.pengendalian === f.pengendalian.toLowerCase() && f.pengendalian.length > 2) {
      anomalies.push({
        id: `anom-case-peng-${f.no}`,
        findingNo: f.no,
        type: 'spelling_inconsistency',
        field: 'Pengendalian',
        message: `Teks pengendalian diawali huruf kecil ("${f.pengendalian}"). Disarankan menggunakan huruf kapital di awal kalimat.`,
        originalValue: f.pengendalian,
        currentValue: f.pengendalian,
        severity: 'info'
      });
    }

    // 6. Nilai di luar daftar valid
    if (!VALID_KATEGORI.includes(f.kategori)) {
      anomalies.push({
        id: `anom-invalid-cat-${f.no}`,
        findingNo: f.no,
        type: 'invalid_value',
        field: 'Kategori',
        message: `Kategori "${f.kategori}" tidak ada dalam daftar kategori baku.`,
        originalValue: f.kategori,
        currentValue: f.kategori,
        severity: 'error'
      });
    }

    if (!VALID_LOKASI.includes(f.lokasi)) {
      anomalies.push({
        id: `anom-invalid-loc-${f.no}`,
        findingNo: f.no,
        type: 'invalid_value',
        field: 'Lokasi',
        message: `Lokasi "${f.lokasi}" tidak ada dalam daftar lokasi baku.`,
        originalValue: f.lokasi,
        currentValue: f.lokasi,
        severity: 'error'
      });
    }

    if (!VALID_TINGKAT_RISIKO.includes(f.tingkatRisiko)) {
      anomalies.push({
        id: `anom-invalid-risk-${f.no}`,
        findingNo: f.no,
        type: 'invalid_value',
        field: 'Tingkat Risiko',
        message: `Tingkat Risiko "${f.tingkatRisiko}" tidak valid.`,
        originalValue: f.tingkatRisiko,
        currentValue: f.tingkatRisiko,
        severity: 'error'
      });
    }

    if (!VALID_STATUS.includes(f.status)) {
      anomalies.push({
        id: `anom-invalid-status-${f.no}`,
        findingNo: f.no,
        type: 'invalid_value',
        field: 'Status',
        message: `Status "${f.status}" tidak valid.`,
        originalValue: f.status,
        currentValue: f.status,
        severity: 'error'
      });
    }
  }

  return anomalies;
}

