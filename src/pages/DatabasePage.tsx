import React from 'react';
import { DataTable } from '../components/database/DataTable';

export const DatabasePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
          DATABASE TEMUAN POTENSI BAHAYA K3
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Kelola master data temuan K3 (CRUD lengkap, pencarian, pengurutan, pagination, serta import/export Excel & CSV).
        </p>
      </div>

      <DataTable />
    </div>
  );
};

