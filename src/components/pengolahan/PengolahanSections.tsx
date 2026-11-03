import React from 'react';
import {
  calculateKPI,
  calculateStatusSummary,
  calculateCategoryBreakdown,
  calculateRiskBreakdown,
  calculateCombinations,
  calculateCrosstabCategoryRisk,
  calculateCrosstabLocationStatus
} from '../../lib/k3-calculations';
import { K3Finding } from '../../types/k3';
import { Activity } from 'lucide-react';

interface PengolahanSectionsProps {
  findings: K3Finding[];
}

export const PengolahanSections: React.FC<PengolahanSectionsProps> = ({ findings }) => {
  const kpi = calculateKPI(findings);
  const status = calculateStatusSummary(findings);
  const categories = calculateCategoryBreakdown(findings);
  const risks = calculateRiskBreakdown(findings);
  const comb = calculateCombinations(findings);
  const crossCatRisk = calculateCrosstabCategoryRisk(findings);
  const crossLocStatus = calculateCrosstabLocationStatus(findings);

  const totalCatCount = categories.reduce((acc, c) => acc + c.jumlah, 0);
  const totalRiskCount = risks.reduce((acc, r) => acc + r.jumlah, 0);

  // Helper for heatmap cell color
  const getHeatmapBg = (val: number, max: number) => {
    if (val === 0) return 'bg-gray-50/40 dark:bg-gray-800/20 text-gray-400';
    const ratio = max > 0 ? val / max : 0;
    if (ratio >= 0.7) return 'bg-emerald-200 dark:bg-emerald-900/60 font-bold text-emerald-950 dark:text-emerald-100';
    if (ratio >= 0.4) return 'bg-emerald-100 dark:bg-emerald-900/40 font-semibold text-emerald-900 dark:text-emerald-200';
    return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300';
  };

  const maxCatRisk = Math.max(
    ...crossCatRisk.rows.flatMap(r => crossCatRisk.cols.map(c => crossCatRisk.data[r][c]))
  );

  const maxLocStatus = Math.max(
    ...crossLocStatus.rows.flatMap(r => crossLocStatus.cols.map(c => crossLocStatus.data[r][c]))
  );

  return (
    <div className="space-y-6">
      {/* 1. RINGKASAN DATA */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#6B8E6B]" />
          RINGKASAN DATA
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center border border-gray-100 dark:border-gray-600">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block uppercase">Total Temuan</span>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 block">{kpi.totalTemuan}</span>
          </div>

          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 rounded-xl text-center border border-red-100 dark:border-red-900/40">
            <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 block uppercase">Risiko Tinggi</span>
            <span className="text-2xl font-extrabold text-red-700 dark:text-red-300 mt-1 block">{kpi.risikoTinggi}</span>
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-center border border-amber-100 dark:border-amber-900/40">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block uppercase">Risiko Sedang</span>
            <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1 block">{kpi.risikoSedang}</span>
          </div>

          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-center border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block uppercase">Risiko Rendah</span>
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 block">{kpi.risikoRendah}</span>
          </div>

          <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-center border border-teal-100 dark:border-teal-900/40">
            <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 block uppercase">Selesai</span>
            <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 mt-1 block">{status.selesai}</span>
          </div>

          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-center border border-blue-100 dark:border-blue-900/40">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block uppercase">Proses</span>
            <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1 block">{status.proses}</span>
          </div>

          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-center border border-rose-100 dark:border-rose-900/40 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block uppercase">Belum</span>
            <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1 block">{status.belum}</span>
          </div>
        </div>
      </div>

      {/* 2. REKAP KATEGORI & REKAP TINGKAT RISIKO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rekap Berdasarkan Kategori */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
            <span>REKAP BERDASARKAN KATEGORI</span>
            <span className="text-xs text-gray-500 font-normal">Normalisasi Ergonomi</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#EAF0EC]/70 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-2.5 px-4">Kategori</th>
                  <th className="py-2.5 px-4 text-center">Jumlah</th>
                  <th className="py-2.5 px-4 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {categories.map(c => (
                  <tr key={c.kategori} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-white">
                      {c.kategori}
                    </td>
                    <td className="py-2.5 px-4 text-center font-semibold text-gray-800 dark:text-gray-200">
                      {c.jumlah}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-gray-600 dark:text-gray-400">
                      {c.persentaseLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700/80 font-bold border-t-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <td className="py-2.5 px-4 text-gray-900 dark:text-white">Total</td>
                  <td className="py-2.5 px-4 text-center text-gray-900 dark:text-white">{totalCatCount}</td>
                  <td className="py-2.5 px-4 text-right text-gray-900 dark:text-white">
                    {totalCatCount > 0 ? '100%' : '0%'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Rekap Tingkat Risiko */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
            <span>REKAP TINGKAT RISIKO</span>
            <span className="text-xs text-gray-500 font-normal">Tinggi, Sedang, Rendah</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#EAF0EC]/70 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-2.5 px-4">Tingkat Risiko</th>
                  <th className="py-2.5 px-4 text-center">Jumlah</th>
                  <th className="py-2.5 px-4 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {risks.map(r => (
                  <tr key={r.tingkatRisiko} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          r.tingkatRisiko === 'Tinggi'
                            ? 'bg-red-500'
                            : r.tingkatRisiko === 'Sedang'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      {r.tingkatRisiko}
                    </td>
                    <td className="py-2.5 px-4 text-center font-semibold text-gray-800 dark:text-gray-200">
                      {r.jumlah}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-gray-600 dark:text-gray-400">
                      {r.persentaseLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700/80 font-bold border-t-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <td className="py-2.5 px-4 text-gray-900 dark:text-white">Total</td>
                  <td className="py-2.5 px-4 text-center text-gray-900 dark:text-white">{totalRiskCount}</td>
                  <td className="py-2.5 px-4 text-right text-gray-900 dark:text-white">
                    {totalRiskCount > 0 ? '100%' : '0%'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* 3. ANALISIS KOMBINASI */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">
          ANALISIS KOMBINASI
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50/70 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50">
            <span className="text-xs font-semibold text-red-800 dark:text-red-300 block">
              Biologis + Risiko Tinggi
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-red-700 dark:text-red-300">
                {comb.biologisTinggi}
              </span>
              <span className="text-xs text-red-600/80 font-medium">Prioritas K3</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 block">
              Ergonomi + Risiko Sedang
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-amber-700 dark:text-amber-300">
                {comb.ergonomiSedang}
              </span>
              <span className="text-xs text-amber-600/80 font-medium">Ergonomis Kerja</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 block">
              Ruang Pelayanan + Proses
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">
                {comb.ruangPelayananProses}
              </span>
              <span className="text-xs text-blue-600/80 font-medium">Dalam Pengerjaan</span>
            </div>
          </div>

          <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900/50">
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300 block">
              Area Tunggu + Risiko Tinggi
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">
                {comb.areaTungguTinggi}
              </span>
              <span className="text-xs text-purple-600/80 font-medium">Area Publik</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CROSSTAB DENGAN HEATMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crosstab 1: Kategori x Risiko */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
            Tabel Silang: Kategori × Tingkat Risiko
          </h3>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-xs sm:text-sm text-center">
              <thead className="bg-[#EAF0EC]/70 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-2.5 px-3 text-left">Kategori</th>
                  {crossCatRisk.cols.map(c => (
                    <th key={c} className="py-2.5 px-3">
                      {c}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 bg-gray-100/60 dark:bg-gray-600/40">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {crossCatRisk.rows.map(r => (
                  <tr key={r}>
                    <td className="py-2.5 px-3 text-left font-medium text-gray-900 dark:text-white">
                      {r}
                    </td>
                    {crossCatRisk.cols.map(c => {
                      const val = crossCatRisk.data[r][c];
                      return (
                        <td key={c} className={`py-2.5 px-3 transition-colors ${getHeatmapBg(val, maxCatRisk)}`}>
                          {val}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 font-bold bg-gray-50/60 dark:bg-gray-700/40 text-gray-900 dark:text-white">
                      {crossCatRisk.rowTotals[r]}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700/80 font-bold border-t-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <td className="py-2.5 px-3 text-left text-gray-900 dark:text-white">Total</td>
                  {crossCatRisk.cols.map(c => (
                    <td key={c} className="py-2.5 px-3 text-gray-900 dark:text-white">
                      {crossCatRisk.colTotals[c]}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600">
                    {crossCatRisk.grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Crosstab 2: Lokasi x Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
            Tabel Silang: Lokasi × Status
          </h3>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-xs sm:text-sm text-center">
              <thead className="bg-[#EAF0EC]/70 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-2.5 px-3 text-left">Lokasi</th>
                  {crossLocStatus.cols.map(c => (
                    <th key={c} className="py-2.5 px-3">
                      {c}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 bg-gray-100/60 dark:bg-gray-600/40">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {crossLocStatus.rows.map(r => (
                  <tr key={r}>
                    <td className="py-2.5 px-3 text-left font-medium text-gray-900 dark:text-white">
                      {r}
                    </td>
                    {crossLocStatus.cols.map(c => {
                      const val = crossLocStatus.data[r][c];
                      return (
                        <td key={c} className={`py-2.5 px-3 transition-colors ${getHeatmapBg(val, maxLocStatus)}`}>
                          {val}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 font-bold bg-gray-50/60 dark:bg-gray-700/40 text-gray-900 dark:text-white">
                      {crossLocStatus.rowTotals[r]}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700/80 font-bold border-t-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <td className="py-2.5 px-3 text-left text-gray-900 dark:text-white">Total</td>
                  {crossLocStatus.cols.map(c => (
                    <td key={c} className="py-2.5 px-3 text-gray-900 dark:text-white">
                      {crossLocStatus.colTotals[c]}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600">
                    {crossLocStatus.grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
