import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react';
import { calculateKPI } from '../../lib/k3-calculations';
import { K3Finding } from '../../types/k3';

interface KPICardsProps {
  findings: K3Finding[];
}

export const KPICards: React.FC<KPICardsProps> = ({ findings }) => {
  const kpi = calculateKPI(findings);
  const total = kpi.totalTemuan;

  const cards = [
    {
      title: 'TOTAL TEMUAN',
      value: kpi.totalTemuan,
      subtext: 'Seluruh temuan terfilter',
      icon: <ClipboardList className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
      borderAccent: 'border-l-4 border-l-gray-600 dark:border-l-gray-400',
      badgeBg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      valueColor: 'text-gray-900 dark:text-white'
    },
    {
      title: 'RISIKO TINGGI',
      value: kpi.risikoTinggi,
      subtext: total > 0 ? `${((kpi.risikoTinggi / total) * 100).toFixed(1).replace('.', ',')}% dari total` : '0%',
      icon: <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      borderAccent: 'border-l-4 border-l-red-600',
      badgeBg: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40',
      valueColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'RISIKO SEDANG',
      value: kpi.risikoSedang,
      subtext: total > 0 ? `${((kpi.risikoSedang / total) * 100).toFixed(1).replace('.', ',')}% dari total` : '0%',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      borderAccent: 'border-l-4 border-l-amber-500',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40',
      valueColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: 'RISIKO RENDAH',
      value: kpi.risikoRendah,
      subtext: total > 0 ? `${((kpi.risikoRendah / total) * 100).toFixed(1).replace('.', ',')}% dari total` : '0%',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      borderAccent: 'border-l-4 border-l-emerald-600',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
      valueColor: 'text-emerald-600 dark:text-emerald-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div
          key={card.title}
          className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md ${card.borderAccent}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {card.title}
            </span>
            <div className={`p-2 rounded-xl ${card.badgeBg}`}>{card.icon}</div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${card.valueColor}`}>
              {card.value}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {card.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

