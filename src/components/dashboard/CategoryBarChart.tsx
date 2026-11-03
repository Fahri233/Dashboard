import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts';
import { calculateCategoryBreakdown } from '../../lib/k3-calculations';
import { K3Finding, KategoriType } from '../../types/k3';
import { useFilter } from '../../context/FilterContext';

interface CategoryBarChartProps {
  findings: K3Finding[];
}

const CATEGORY_COLORS: Record<KategoriType, string> = {
  Ergonomi: '#6366F1',   // Indigo
  Biologis: '#0D9488',   // Teal
  Fisik: '#F97316',      // Orange
  Psikososial: '#8B5CF6',// Purple
  Kimia: '#06B6D4'       // Cyan
};

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ findings }) => {
  const data = calculateCategoryBreakdown(findings);
  const { toggleKategori, filter } = useFilter();

  const handleBarClick = (entry: any) => {
    if (entry && entry.kategori) {
      toggleKategori(entry.kategori as KategoriType);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Potensi Bahaya Berdasarkan Kategori
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Distribusi 5 kategori bahaya K3 (Klik batang untuk filter)
          </p>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
            <XAxis
              dataKey="kategori"
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-xs">
                      <div className="font-bold text-gray-800 dark:text-gray-200">{d.kategori}</div>
                      <div className="text-gray-600 dark:text-gray-400 mt-1">
                        Jumlah: <span className="font-semibold text-gray-900 dark:text-white">{d.jumlah}</span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Persentase: <span className="font-semibold text-gray-900 dark:text-white">{d.persentaseLabel}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="jumlah"
              radius={[6, 6, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            >
              <LabelList dataKey="jumlah" position="top" fill="#475569" fontSize={12} fontWeight={600} />
              {data.map(entry => {
                const isSelected = filter.kategori.includes(entry.kategori);
                return (
                  <Cell
                    key={`cell-${entry.kategori}`}
                    fill={CATEGORY_COLORS[entry.kategori] || '#354F52'}
                    opacity={isSelected ? 1 : 0.35}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/60 mt-2">
        {data.map(d => (
          <div key={d.kategori} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: CATEGORY_COLORS[d.kategori] }}
            />
            <span>
              {d.kategori}: <strong>{d.jumlah}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

