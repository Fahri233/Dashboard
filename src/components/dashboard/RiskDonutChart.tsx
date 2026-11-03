import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { calculateRiskBreakdown } from '../../lib/k3-calculations';
import { K3Finding, TingkatRisikoType } from '../../types/k3';
import { useFilter } from '../../context/FilterContext';

interface RiskDonutChartProps {
  findings: K3Finding[];
}

const RISK_COLORS: Record<TingkatRisikoType, string> = {
  Tinggi: '#DC2626',
  Sedang: '#F59E0B',
  Rendah: '#16A34A'
};

export const RiskDonutChart: React.FC<RiskDonutChartProps> = ({ findings }) => {
  const data = calculateRiskBreakdown(findings);
  const { toggleTingkatRisiko, filter } = useFilter();

  const handlePieClick = (entry: any) => {
    if (entry && entry.tingkatRisiko) {
      toggleTingkatRisiko(entry.tingkatRisiko as TingkatRisikoType);
    }
  };

  const total = data.reduce((acc, cur) => acc + cur.jumlah, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Tingkat Risiko</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Proporsi risiko Tinggi, Sedang, Rendah (Klik irisan untuk filter)
          </p>
        </div>
      </div>

      <div className="w-full h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="jumlah"
              nameKey="tingkatRisiko"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              onClick={handlePieClick}
              className="cursor-pointer"
              label={props => {
                const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
                if (!percent) return null;
                const RADIAN = Math.PI / 180;
                const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 1.35;
                const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
                const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);
                return (
                  <text
                    x={x}
                    y={y}
                    fill="#475569"
                    textAnchor={x > Number(cx) ? 'start' : 'end'}
                    dominantBaseline="central"
                    className="text-[11px] font-semibold"
                  >
                    {`${(Number(percent) * 100).toFixed(1).replace('.', ',')}%`}
                  </text>
                );
              }}
            >
              {data.map(entry => {
                const isSelected = filter.tingkatRisiko.includes(entry.tingkatRisiko);
                return (
                  <Cell
                    key={`cell-${entry.tingkatRisiko}`}
                    fill={RISK_COLORS[entry.tingkatRisiko]}
                    opacity={isSelected ? 1 : 0.3}
                  />
                );
              })}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-xs">
                      <div className="font-bold flex items-center gap-1.5" style={{ color: RISK_COLORS[d.tingkatRisiko as TingkatRisikoType] }}>
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: RISK_COLORS[d.tingkatRisiko as TingkatRisikoType] }} />
                        {d.tingkatRisiko}
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
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={value => {
                const item = data.find(d => d.tingkatRisiko === value);
                return (
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {value}: <strong>{item?.jumlah || 0}</strong> ({item?.persentaseLabel || '0%'})
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-9">
          <span className="text-2xl font-black text-gray-900 dark:text-white">{total}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total</span>
        </div>
      </div>
    </div>
  );
};
