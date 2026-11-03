import {
  K3Finding,
  FilterState,
  KategoriType,
  TingkatRisikoType,
  LokasiType,
  StatusType,
  VALID_KATEGORI,
  VALID_TINGKAT_RISIKO,
  VALID_LOKASI,
  VALID_STATUS
} from '../types/k3';

export function filterFindings(findings: K3Finding[], filter: FilterState): K3Finding[] {
  return findings.filter(item => {
    if (filter.lokasi && filter.lokasi.length > 0 && !filter.lokasi.includes(item.lokasi)) {
      return false;
    }
    if (filter.kategori && filter.kategori.length > 0 && !filter.kategori.includes(item.kategori)) {
      return false;
    }
    if (filter.tingkatRisiko && filter.tingkatRisiko.length > 0 && !filter.tingkatRisiko.includes(item.tingkatRisiko)) {
      return false;
    }
    if (filter.status && filter.status.length > 0 && !filter.status.includes(item.status)) {
      return false;
    }
    if (filter.startDate && item.tanggalIso < filter.startDate) {
      return false;
    }
    if (filter.endDate && item.tanggalIso > filter.endDate) {
      return false;
    }
    if (filter.searchQuery && filter.searchQuery.trim() !== '') {
      const q = filter.searchQuery.toLowerCase();
      const match =
        item.aktivitas.toLowerCase().includes(q) ||
        item.potensiBahaya.toLowerCase().includes(q) ||
        item.pengendalian.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q) ||
        item.lokasi.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.tingkatRisiko.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.tanggal.includes(q) ||
        String(item.no).includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export interface KPIData {
  totalTemuan: number;
  risikoTinggi: number;
  risikoSedang: number;
  risikoRendah: number;
}

export function calculateKPI(findings: K3Finding[]): KPIData {
  let tinggi = 0;
  let sedang = 0;
  let rendah = 0;

  for (const f of findings) {
    if (f.tingkatRisiko === 'Tinggi') tinggi++;
    else if (f.tingkatRisiko === 'Sedang') sedang++;
    else if (f.tingkatRisiko === 'Rendah') rendah++;
  }

  return {
    totalTemuan: findings.length,
    risikoTinggi: tinggi,
    risikoSedang: sedang,
    risikoRendah: rendah
  };
}

export interface StatusSummary {
  selesai: number;
  proses: number;
  belum: number;
  total: number;
}

export function calculateStatusSummary(findings: K3Finding[]): StatusSummary {
  let selesai = 0;
  let proses = 0;
  let belum = 0;

  for (const f of findings) {
    if (f.status === 'Selesai') selesai++;
    else if (f.status === 'Proses') proses++;
    else if (f.status === 'Belum') belum++;
  }

  return {
    selesai,
    proses,
    belum,
    total: findings.length
  };
}

export interface CategoryBreakdownItem {
  kategori: KategoriType;
  jumlah: number;
  persentase: number; // e.g. 18.2
  persentaseLabel: string; // e.g. "18,2%"
}

export function calculateCategoryBreakdown(findings: K3Finding[]): CategoryBreakdownItem[] {
  const counts: Record<KategoriType, number> = {
    Ergonomi: 0,
    Biologis: 0,
    Fisik: 0,
    Psikososial: 0,
    Kimia: 0
  };

  for (const f of findings) {
    if (counts[f.kategori] !== undefined) {
      counts[f.kategori]++;
    }
  }

  const total = findings.length;

  return VALID_KATEGORI.map(kat => {
    const jumlah = counts[kat];
    const persentase = total > 0 ? Number(((jumlah / total) * 100).toFixed(1)) : 0;
    const persentaseLabel = `${persentase.toString().replace('.', ',')}%`;
    return {
      kategori: kat,
      jumlah,
      persentase,
      persentaseLabel
    };
  });
}

export interface RiskBreakdownItem {
  tingkatRisiko: TingkatRisikoType;
  jumlah: number;
  persentase: number;
  persentaseLabel: string;
}

export function calculateRiskBreakdown(findings: K3Finding[]): RiskBreakdownItem[] {
  const counts: Record<TingkatRisikoType, number> = {
    Tinggi: 0,
    Sedang: 0,
    Rendah: 0
  };

  for (const f of findings) {
    if (counts[f.tingkatRisiko] !== undefined) {
      counts[f.tingkatRisiko]++;
    }
  }

  const total = findings.length;

  return VALID_TINGKAT_RISIKO.map(r => {
    const jumlah = counts[r];
    const persentase = total > 0 ? Number(((jumlah / total) * 100).toFixed(1)) : 0;
    const persentaseLabel = `${persentase.toString().replace('.', ',')}%`;
    return {
      tingkatRisiko: r,
      jumlah,
      persentase,
      persentaseLabel
    };
  });
}

export interface LocationBreakdownItem {
  lokasi: LokasiType;
  jumlah: number;
  persentase: number;
  persentaseLabel: string;
}

export function calculateLocationBreakdown(findings: K3Finding[]): LocationBreakdownItem[] {
  const counts: Record<LokasiType, number> = {
    'Meja Pendaftaran': 0,
    'Ruang Pelayanan': 0,
    'Area Tunggu': 0
  };

  for (const f of findings) {
    if (counts[f.lokasi] !== undefined) {
      counts[f.lokasi]++;
    }
  }

  const total = findings.length;

  // Ordered as in Excel / prompt: Meja Pendaftaran, Ruang Pelayanan, Area Tunggu
  const order: LokasiType[] = ['Meja Pendaftaran', 'Ruang Pelayanan', 'Area Tunggu'];
  return order.map(loc => {
    const jumlah = counts[loc];
    const persentase = total > 0 ? Number(((jumlah / total) * 100).toFixed(1)) : 0;
    const persentaseLabel = `${persentase.toString().replace('.', ',')}%`;
    return {
      lokasi: loc,
      jumlah,
      persentase,
      persentaseLabel
    };
  });
}

const INDONESIAN_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export interface MonthlyTrendItem {
  key: string; // "YYYY-MM"
  label: string; // "MMM YYYY" e.g. "Jan 2025"
  jumlah: number;
}

export function calculateMonthlyTrend(findings: K3Finding[], showEmptyMonths: boolean = false): MonthlyTrendItem[] {
  if (findings.length === 0) return [];

  // Group by YYYY-MM
  const map = new Map<string, number>();

  for (const f of findings) {
    const ym = f.tanggalIso.substring(0, 7); // "YYYY-MM"
    map.set(ym, (map.get(ym) || 0) + 1);
  }

  const sortedKeys = Array.from(map.keys()).sort();

  if (!showEmptyMonths) {
    return sortedKeys.map(ym => {
      const [yearStr, monthStr] = ym.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      const label = `${INDONESIAN_MONTHS[monthIdx]} ${yearStr}`;
      return {
        key: ym,
        label,
        jumlah: map.get(ym) || 0
      };
    });
  }

  // Fill in empty months between min and max
  const minKey = sortedKeys[0];
  const maxKey = sortedKeys[sortedKeys.length - 1];

  const [minYear, minMonth] = minKey.split('-').map(Number);
  const [maxYear, maxMonth] = maxKey.split('-').map(Number);

  const result: MonthlyTrendItem[] = [];
  let curY = minYear;
  let curM = minMonth;

  while (curY < maxYear || (curY === maxYear && curM <= maxMonth)) {
    const ym = `${curY}-${String(curM).padStart(2, '0')}`;
    const label = `${INDONESIAN_MONTHS[curM - 1]} ${curY}`;
    result.push({
      key: ym,
      label,
      jumlah: map.get(ym) || 0
    });

    curM++;
    if (curM > 12) {
      curM = 1;
      curY++;
    }
  }

  return result;
}

export interface CombinationAnalysis {
  biologisTinggi: number;
  ergonomiSedang: number;
  ruangPelayananProses: number;
  areaTungguTinggi: number;
}

export function calculateCombinations(findings: K3Finding[]): CombinationAnalysis {
  let biologisTinggi = 0;
  let ergonomiSedang = 0;
  let ruangPelayananProses = 0;
  let areaTungguTinggi = 0;

  for (const f of findings) {
    if (f.kategori === 'Biologis' && f.tingkatRisiko === 'Tinggi') {
      biologisTinggi++;
    }
    if (f.kategori === 'Ergonomi' && f.tingkatRisiko === 'Sedang') {
      ergonomiSedang++;
    }
    if (f.lokasi === 'Ruang Pelayanan' && f.status === 'Proses') {
      ruangPelayananProses++;
    }
    if (f.lokasi === 'Area Tunggu' && f.tingkatRisiko === 'Tinggi') {
      areaTungguTinggi++;
    }
  }

  return {
    biologisTinggi,
    ergonomiSedang,
    ruangPelayananProses,
    areaTungguTinggi
  };
}

export interface CrosstabMatrix<R extends string, C extends string> {
  rows: R[];
  cols: C[];
  data: Record<R, Record<C, number>>;
  rowTotals: Record<R, number>;
  colTotals: Record<C, number>;
  grandTotal: number;
}

export function calculateCrosstabCategoryRisk(findings: K3Finding[]): CrosstabMatrix<KategoriType, TingkatRisikoType> {
  const data: Record<KategoriType, Record<TingkatRisikoType, number>> = {
    Ergonomi: { Tinggi: 0, Sedang: 0, Rendah: 0 },
    Biologis: { Tinggi: 0, Sedang: 0, Rendah: 0 },
    Fisik: { Tinggi: 0, Sedang: 0, Rendah: 0 },
    Psikososial: { Tinggi: 0, Sedang: 0, Rendah: 0 },
    Kimia: { Tinggi: 0, Sedang: 0, Rendah: 0 }
  };

  const rowTotals: Record<KategoriType, number> = {
    Ergonomi: 0,
    Biologis: 0,
    Fisik: 0,
    Psikososial: 0,
    Kimia: 0
  };

  const colTotals: Record<TingkatRisikoType, number> = {
    Tinggi: 0,
    Sedang: 0,
    Rendah: 0
  };

  for (const f of findings) {
    if (data[f.kategori] && data[f.kategori][f.tingkatRisiko] !== undefined) {
      data[f.kategori][f.tingkatRisiko]++;
      rowTotals[f.kategori]++;
      colTotals[f.tingkatRisiko]++;
    }
  }

  return {
    rows: VALID_KATEGORI,
    cols: VALID_TINGKAT_RISIKO,
    data,
    rowTotals,
    colTotals,
    grandTotal: findings.length
  };
}

export function calculateCrosstabLocationStatus(findings: K3Finding[]): CrosstabMatrix<LokasiType, StatusType> {
  const data: Record<LokasiType, Record<StatusType, number>> = {
    'Area Tunggu': { Belum: 0, Proses: 0, Selesai: 0 },
    'Meja Pendaftaran': { Belum: 0, Proses: 0, Selesai: 0 },
    'Ruang Pelayanan': { Belum: 0, Proses: 0, Selesai: 0 }
  };

  const rowTotals: Record<LokasiType, number> = {
    'Area Tunggu': 0,
    'Meja Pendaftaran': 0,
    'Ruang Pelayanan': 0
  };

  const colTotals: Record<StatusType, number> = {
    Belum: 0,
    Proses: 0,
    Selesai: 0
  };

  for (const f of findings) {
    if (data[f.lokasi] && data[f.lokasi][f.status] !== undefined) {
      data[f.lokasi][f.status]++;
      rowTotals[f.lokasi]++;
      colTotals[f.status]++;
    }
  }

  return {
    rows: VALID_LOKASI,
    cols: VALID_STATUS,
    data,
    rowTotals,
    colTotals,
    grandTotal: findings.length
  };
}

export function getAttentionFindings(findings: K3Finding[]): K3Finding[] {
  return findings
    .filter(f => f.tingkatRisiko === 'Tinggi' && f.status !== 'Selesai')
    .sort((a, b) => a.tanggalIso.localeCompare(b.tanggalIso));
}

export function getRecentFindings(findings: K3Finding[], limit?: number): K3Finding[] {
  const sorted = [...findings].sort((a, b) => {
    // Descending by date
    const cmp = b.tanggalIso.localeCompare(a.tanggalIso);
    if (cmp !== 0) return cmp;
    return b.no - a.no;
  });
  return limit ? sorted.slice(0, limit) : sorted;
}

