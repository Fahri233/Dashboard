import { describe, it, expect } from 'vitest';
import seedData from '../data/seed.json';
import { K3Finding, FilterState } from '../types/k3';
import {
  calculateKPI,
  calculateStatusSummary,
  calculateLocationBreakdown,
  calculateCategoryBreakdown,
  calculateRiskBreakdown,
  calculateCombinations,
  calculateMonthlyTrend,
  getRecentFindings,
  filterFindings
} from './k3-calculations';

const findings = seedData as K3Finding[];

describe('K3 Calculations vs Angka Acuan Checklist', () => {
  it('harus mencocokkan Total Temuan dan Tingkat Risiko', () => {
    const kpi = calculateKPI(findings);
    expect(kpi.totalTemuan).toBe(22);
    expect(kpi.risikoTinggi).toBe(8);
    expect(kpi.risikoSedang).toBe(10);
    expect(kpi.risikoRendah).toBe(4);

    const risks = calculateRiskBreakdown(findings);
    const tinggi = risks.find(r => r.tingkatRisiko === 'Tinggi');
    const sedang = risks.find(r => r.tingkatRisiko === 'Sedang');
    const rendah = risks.find(r => r.tingkatRisiko === 'Rendah');
    expect(tinggi?.jumlah).toBe(8);
    expect(sedang?.jumlah).toBe(10);
    expect(rendah?.jumlah).toBe(4);
  });

  it('harus mencocokkan Rekap Status', () => {
    const status = calculateStatusSummary(findings);
    expect(status.selesai).toBe(11);
    expect(status.proses).toBe(9);
    expect(status.belum).toBe(2);
    expect(status.total).toBe(22);
  });

  it('harus mencocokkan Rekap Lokasi', () => {
    const loc = calculateLocationBreakdown(findings);
    const meja = loc.find(l => l.lokasi === 'Meja Pendaftaran');
    const ruang = loc.find(l => l.lokasi === 'Ruang Pelayanan');
    const tunggu = loc.find(l => l.lokasi === 'Area Tunggu');

    expect(meja?.jumlah).toBe(10);
    expect(ruang?.jumlah).toBe(7);
    expect(tunggu?.jumlah).toBe(5);
  });

  it('harus mencocokkan Rekap Kategori setelah normalisasi Egronomi -> Ergonomi', () => {
    const cat = calculateCategoryBreakdown(findings);
    const ergonomi = cat.find(c => c.kategori === 'Ergonomi');
    const biologis = cat.find(c => c.kategori === 'Biologis');
    const fisik = cat.find(c => c.kategori === 'Fisik');
    const psikososial = cat.find(c => c.kategori === 'Psikososial');
    const kimia = cat.find(c => c.kategori === 'Kimia');

    expect(ergonomi?.jumlah).toBe(4);
    expect(ergonomi?.persentaseLabel).toBe('18,2%');

    expect(biologis?.jumlah).toBe(7);
    expect(biologis?.persentaseLabel).toBe('31,8%');

    expect(fisik?.jumlah).toBe(5);
    expect(fisik?.persentaseLabel).toBe('22,7%');

    expect(psikososial?.jumlah).toBe(6);
    expect(psikososial?.persentaseLabel).toBe('27,3%');

    expect(kimia?.jumlah).toBe(0);
    expect(kimia?.persentaseLabel).toBe('0%');

    const totalKategori = cat.reduce((acc, c) => acc + c.jumlah, 0);
    expect(totalKategori).toBe(22);
  });

  it('harus mencocokkan 4 Analisis Kombinasi', () => {
    const comb = calculateCombinations(findings);
    expect(comb.biologisTinggi).toBe(7);
    expect(comb.ergonomiSedang).toBe(3);
    expect(comb.ruangPelayananProses).toBe(5);
    expect(comb.areaTungguTinggi).toBe(1);
  });

  it('harus mencocokkan Tren Temuan K3 per Bulan', () => {
    const trend = calculateMonthlyTrend(findings, false);
    // Jan 2025 = 12, Feb 2025 = 6, Mar 2025 = 2, Nov 2026 = 1, Nov 2027 = 1
    const trendMap = Object.fromEntries(trend.map(t => [t.label, t.jumlah]));

    expect(trendMap['Jan 2025']).toBe(12);
    expect(trendMap['Feb 2025']).toBe(6);
    expect(trendMap['Mar 2025']).toBe(2);
    expect(trendMap['Nov 2026']).toBe(1);
    expect(trendMap['Nov 2027']).toBe(1);
  });

  it('harus mengurutkan Temuan Terbaru paling atas', () => {
    const recent = getRecentFindings(findings, 3);
    expect(recent[0].no).toBe(22); // 02/11/2027
    expect(recent[1].no).toBe(21); // 02/11/2026
    expect(recent[2].no).toBe(20); // 10/03/2025
  });

  it('harus memvalidasi Uji Filter: Ruang Pelayanan', () => {
    const filter: FilterState = {
      lokasi: ['Ruang Pelayanan'],
      kategori: ['Ergonomi', 'Biologis', 'Fisik', 'Psikososial', 'Kimia'],
      tingkatRisiko: ['Tinggi', 'Sedang', 'Rendah'],
      status: ['Belum', 'Proses', 'Selesai']
    };
    const filtered = filterFindings(findings, filter);
    const kpi = calculateKPI(filtered);
    const status = calculateStatusSummary(filtered);

    expect(kpi.totalTemuan).toBe(7);
    expect(status.selesai).toBe(1);
    expect(status.proses).toBe(5);
    expect(status.belum).toBe(1);
  });

  it('harus memvalidasi Uji Filter: Risiko Tinggi', () => {
    const filter: FilterState = {
      lokasi: ['Area Tunggu', 'Meja Pendaftaran', 'Ruang Pelayanan'],
      kategori: ['Ergonomi', 'Biologis', 'Fisik', 'Psikososial', 'Kimia'],
      tingkatRisiko: ['Tinggi'],
      status: ['Belum', 'Proses', 'Selesai']
    };
    const filtered = filterFindings(findings, filter);
    const kpi = calculateKPI(filtered);
    const status = calculateStatusSummary(filtered);

    expect(kpi.totalTemuan).toBe(8);
    expect(status.selesai).toBe(1);
    expect(status.proses).toBe(5);
    expect(status.belum).toBe(2);
  });
});
