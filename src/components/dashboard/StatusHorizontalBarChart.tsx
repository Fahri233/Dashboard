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
import { calculateStatusSummary } from '../../lib/k3-calculations';
import { K3Finding, StatusType } from '../../types/k3';
import { useFilter } from '../../context/FilterContext';

interface StatusHorizontalBarChartProps {
  findings: K3Finding[];
}

const STATUS_COLORS: Record<StatusType, string> = {
  Selesai: '#16A34A', // Emerald
  Proses: '#2563EB',  // Blue
  Belum: '#E11D48'    // Rose/Red
};

export const StatusHorizontalBarChart: React.FC<StatusHorizontalBarChartProps> = ({ findings }) => {
  const summary = calculateStatusSummary(findings);
  const { toggleStatus, filter } = useFilter();

  const data: { status: StatusType; jumlah: number; persentaseLabel: string }[] = [
    {
      status: 'Selesai',
      jumlah: summary.selesai,
      persentaseLabel: summary.total > 0 ? `${((summary.selesai / summary.total) * 100).toFixed(1).replace('.', ',')}%` : '0%'
    },
    {
      status: 'Proses',
      jumlah: summary.proses,
      persentaseLabel: summary.total > 0 ? `${((summary.proses / summary.total) * 100).toFixed(1).replace('.', ',')}%` : '0%'
    },
    {
      status: 'Belum',
      jumlah: summary.belum,
      persentaseLabel: summary.total > 0 ? `${((summary.belum / summary.total) * 100).toFixed(1).replace('.', ',')}%` : '0%'
    }
  ];

  const handleBarClick = (entry: any) => {
    if (entry && entry.status) {
      toggleStatus(entry.status as StatusType);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Status Tindak Lanjut</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Progres penyelesaian temuan (Klik batang untuk filter)
          </p>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 15, right: 35, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.6} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="status"
              tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-xs">
                      <div className="font-bold flex items-center gap-1.5" style={{ color: STATUS_COLORS[d.status as StatusType] }}>
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[d.status as StatusType] }} />
                        {d.status}
                      </div>
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
              radius={[0, 6, 6, 0]}
              onClick={handleBarClick}
              className="cursor-pointer"
            >
              <LabelList dataKey="jumlah" position="right" fill="#475569" fontSize={12} fontWeight={600} />
              {data.map(entry => {
                const isSelected = filter.status.includes(entry.status);
                return (
                  <Cell
                    key={`cell-${entry.status}`}
                    fill={STATUS_COLORS[entry.status]}
                    opacity={isSelected ? 1 : 0.3}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/60 mt-2">
        {data.map(d => (
          <div key={d.status} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: STATUS_COLORS[d.status] }}
            />
            <span>
              {d.status}: <strong>{d.jumlah}</strong> ({d.persentaseLabel})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

