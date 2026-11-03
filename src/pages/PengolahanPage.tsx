import React from 'react';
import { useK3Data } from '../context/K3DataContext';
import { PengolahanSections } from '../components/pengolahan/PengolahanSections';
import { FilterSection } from '../components/dashboard/FilterSection';

export const PengolahanPage: React.FC = () => {
  const { filteredFindings } = useK3Data();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
            PENGOLAHAN DATA MONITORING POTENSI BAHAYA K3
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Perhitungan analitik otomatis, tabel silang (crosstab) dengan heatmap, dan rekapitulasi data.
          </p>
        </div>
      </div>

      {/* Slicer Filter Section (follows global filter) */}
      <FilterSection />

      {/* Analytics Sections */}
      <PengolahanSections findings={filteredFindings} />
    </div>
  );
};

