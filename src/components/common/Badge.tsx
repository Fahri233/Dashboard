import React from 'react';
import { TingkatRisikoType, StatusType, KategoriType } from '../../types/k3';

interface BadgeProps {
  type: 'risiko' | 'status' | 'kategori';
  value: TingkatRisikoType | StatusType | KategoriType | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  let colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';

  if (type === 'risiko') {
    switch (value) {
      case 'Tinggi':
        colorClasses = 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800/60';
        break;
      case 'Sedang':
        colorClasses = 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
        break;
      case 'Rendah':
        colorClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
        break;
    }
  } else if (type === 'status') {
    switch (value) {
      case 'Selesai':
        colorClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
        break;
      case 'Proses':
        colorClasses = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
        break;
      case 'Belum':
        colorClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
        break;
    }
  } else if (type === 'kategori') {
    switch (value) {
      case 'Ergonomi':
        colorClasses = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
        break;
      case 'Biologis':
        colorClasses = 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800/60';
        break;
      case 'Fisik':
        colorClasses = 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800/60';
        break;
      case 'Psikososial':
        colorClasses = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
        break;
      case 'Kimia':
        colorClasses = 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border shadow-xs transition-colors ${sizeClasses} ${colorClasses}`}
    >
      {value}
    </span>
  );
};

