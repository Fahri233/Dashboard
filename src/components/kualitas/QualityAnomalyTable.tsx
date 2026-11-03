import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  Wrench,
  Sparkles
} from 'lucide-react';
import { detectDataQualityAnomalies } from '../../lib/data-quality';
import { useK3Data } from '../../context/K3DataContext';
import { K3Finding, QualityAnomaly } from '../../types/k3';
import { FindingFormModal } from '../database/FindingFormModal';
import { Button } from '../common/Button';

export const QualityAnomalyTable: React.FC = () => {
  const { findings, updateFinding } = useK3Data();
  const anomalies = detectDataQualityAnomalies(findings);

  const [editingFinding, setEditingFinding] = useState<K3Finding | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFix = (anomaly: QualityAnomaly) => {
    const target = findings.find(f => f.no === anomaly.findingNo);
    if (target) {
      setEditingFinding(target);
      setIsFormOpen(true);
    }
  };

  const getSeverityBadge = (sev: QualityAnomaly['severity']) => {
    switch (sev) {
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            Error
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Peringatan
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Info className="w-3 h-3 text-blue-600" />
            Normalisasi / Info
          </span>
        );
    }
  };

  const totalAnomalies = anomalies.length;
  const warningCount = anomalies.filter(a => a.severity === 'warning').length;
  const infoCount = anomalies.filter(a => a.severity === 'info').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Isu Terdeteksi</span>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{totalAnomalies} Catatan</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-xl text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Peringatan Kritis</span>
            <div className="text-2xl font-black text-red-600 dark:text-red-400">{warningCount} Perlu Ditinjau</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Dinormalisasi Otomatis</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{infoCount} Dibenahi</div>
          </div>
        </div>
      </div>

      {/* Rules Explanatory Banner */}
      <div className="bg-[#EAF0EC] dark:bg-gray-800/80 p-5 rounded-2xl border border-emerald-100 dark:border-gray-700 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
        <h4 className="font-bold text-[#354F52] dark:text-emerald-300 uppercase tracking-wide mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#6B8E6B]" />
          Aturan Audit & Integritas Kualitas Data
        </h4>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
          <li>
            <strong>Normalisasi Kategori:</strong> Typo <code>"Egronomi"</code> otomatis dinormalisasi menjadi <code>"Ergonomi"</code> agar perhitungan pivot & rekap kategori akurat.
          </li>
          <li>
            <strong>Pembersihan Spasi:</strong> Whitespace di akhir/awal teks (seperti <code>"pengaturan "</code>) dibersihkan dengan aman di lapisan data.
          </li>
          <li>
            <strong>Pendeteksian Masa Depan:</strong> Menandai tanggal temuan di masa mendatang (seperti No 22 tahun 2027) untuk diverifikasi ulang oleh pengguna.
          </li>
          <li>
            <strong>Heuristik Bahaya vs Kategori:</strong> Bahaya fisik terpeleset (Kepleset) terdeteksi berada di kategori Biologis.
          </li>
        </ul>
      </div>

      {/* Anomaly Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Daftar Temuan dan Audit Kualitas Data
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Setiap catatan memuat nomor temuan, pesan anomali, perbandingan nilai asli vs nilai setelah normalisasi, serta tombol tindakan.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#EAF0EC]/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 px-4">Tingkat</th>
                <th className="py-3 px-4 text-center">No Temuan</th>
                <th className="py-3 px-4">Kolom / Field</th>
                <th className="py-3 px-4">Deskripsi Audit</th>
                <th className="py-3 px-4">Nilai Asli (Raw)</th>
                <th className="py-3 px-4">Nilai Saat Ini</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    Seluruh data berkualitas prima! Tidak ada anomali atau peringatan terdeteksi.
                  </td>
                </tr>
              ) : (
                anomalies.map(anom => (
                  <tr key={anom.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getSeverityBadge(anom.severity)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-gray-900 dark:text-white">
                      #{anom.findingNo}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {anom.field}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 max-w-sm">
                      {anom.message}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 rounded">
                      {anom.originalValue}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded font-semibold">
                      {anom.currentValue}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Wrench className="w-3.5 h-3.5 text-[#354F52] dark:text-[#6B8E6B]" />}
                        onClick={() => handleFix(anom)}
                      >
                        Perbaiki
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Modal */}
      <FindingFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFinding(null);
        }}
        initialData={editingFinding}
        nextNo={findings.length + 1}
        onSubmit={data => {
          if (editingFinding) {
            updateFinding({ ...data, id: editingFinding.id });
          }
        }}
      />
    </div>
  );
};
