import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { K3Finding } from '../../types/k3';
import { getRecentFindings } from '../../lib/k3-calculations';
import { Badge } from '../common/Badge';

interface RecentFindingsTableProps {
  findings: K3Finding[];
}

export const RecentFindingsTable: React.FC<RecentFindingsTableProps> = ({ findings }) => {
  const recentFindings = getRecentFindings(findings, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6B8E6B]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              TEMUAN TERBARU
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            10 temuan terakhir (diurutkan dari tanggal paling baru, tanpa baris kosong)
          </p>
        </div>

        <Link
          to="/database"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EAF0EC] hover:bg-[#dbe6df] text-[#354F52] dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span>Lihat semua ({findings.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[#EAF0EC]/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Aktivitas</th>
              <th className="py-3 px-4">Potensi Bahaya</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Tingkat Risiko</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentFindings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                  Tidak ada data temuan yang cocok dengan filter saat ini.
                </td>
              </tr>
            ) : (
              recentFindings.map(item => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {item.tanggal}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {item.aktivitas}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                    {item.potensiBahaya}
                  </td>
                  <td className="py-3 px-4">
                    <Badge type="kategori" value={item.kategori} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <Badge type="risiko" value={item.tingkatRisiko} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <Badge type="status" value={item.status} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

