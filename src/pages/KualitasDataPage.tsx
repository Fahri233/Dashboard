import React from 'react';
import { QualityAnomalyTable } from '../components/kualitas/QualityAnomalyTable';

export const KualitasDataPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
          PANEL KUALITAS DATA & AUDIT ANOMALI
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Verifikasi integritas data, normalisasi otomatis nilai mentah (raw), dan deteksi dini inkonsistensi data K3.
        </p>
      </div>

      <QualityAnomalyTable />
    </div>
  );
};

