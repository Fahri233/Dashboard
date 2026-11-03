import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAttentionFindings } from '../../lib/k3-calculations';
import { K3Finding } from '../../types/k3';
import { Badge } from '../common/Badge';

interface AttentionPanelProps {
  findings: K3Finding[];
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({ findings }) => {
  const urgentFindings = getAttentionFindings(findings);

  if (urgentFindings.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50/70 dark:bg-red-950/30 rounded-2xl p-5 border border-red-200 dark:border-red-900/50 shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            PERLU PERHATIAN ({urgentFindings.length} Temuan Risiko Tinggi Belum Selesai)
          </h3>
        </div>
        <Link
          to="/database"
          className="text-xs font-semibold text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-1 hover:underline"
        >
          <span>Kelola di Database</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {urgentFindings.map(f => (
          <div
            key={f.id}
            className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-red-100 dark:border-red-900/40 shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-500" />
                {f.tanggal}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge type="risiko" value={f.tingkatRisiko} size="sm" />
                <Badge type="status" value={f.status} size="sm" />
              </div>
            </div>

            <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
              {f.potensiBahaya}
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
              <span>{f.lokasi}</span>
              <span className="text-gray-400">({f.aktivitas})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

