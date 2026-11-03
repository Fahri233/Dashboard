import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { calculateMonthlyTrend } from '../../lib/k3-calculations';
import { K3Finding } from '../../types/k3';

interface TrendLineChartProps {
  findings: K3Finding[];
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ findings }) => {
  const [showEmptyMonths, setShowEmptyMonths] = useState(false);
  const data = calculateMonthlyTrend(findings, showEmptyMonths);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Tren Temuan K3 per Bulan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Jumlah temuan sepanjang waktu (diperbaiki dari grafik Excel yang rusak)
          </p>
        </div>

        {/* Toggle tampilkan bulan kosong */}
        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showEmptyMonths}
            onChange={e => setShowEmptyMonths(e.target.checked)}
            className="w-3.5 h-3.5 text-[#354F52] dark:text-[#6B8E6B] rounded border-gray-300 focus:ring-0 cursor-pointer"
          />
          <span>Tampilkan bulan kosong</span>
        </label>
      </div>

      <div className="w-full h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Tidak ada data untuk rentang ini
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis
                dataKey="label"
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
                        <div className="font-bold text-gray-800 dark:text-gray-200">{d.label}</div>
                        <div className="text-gray-600 dark:text-gray-400 mt-1">
                          Jumlah Temuan: <span className="font-semibold text-[#354F52] dark:text-[#6B8E6B]">{d.jumlah}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="jumlah"
                name="Temuan"
                stroke="#354F52"
                strokeWidth={3}
                dot={{ r: 4, fill: '#354F52', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#6B8E6B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="pt-2 text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700/60 mt-2">
        * Sumbu X menampilkan bulan dan tahun temuan (format MMM yyyy).
      </div>
    </div>
  );
};

